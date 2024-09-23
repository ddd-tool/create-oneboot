pub fn enum_demo1() -> String {
    r#"package com.github.alphafoxz.oneboot.preset_sys.gen.restl.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Schema(description = "Abac动态授权类型")
@AllArgsConstructor
@Getter
public enum PsysAbacDynamicAuthTypeEnum {
    /**主动*/
    INITIATIVE(0),
    /**被动*/
    PASSIVE(1);

    private final int value;
}"#
    .into()
}

pub fn class_demo1() -> String {
    r#"package com.github.alphafoxz.oneboot.domain.preset_sys.user;

import com.github.alphafoxz.oneboot.core.domain.DomainBusinessException;
import com.github.alphafoxz.oneboot.core.domain.DomainEventPublisher;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.command.*;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.event.*;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.Account;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.PasswordVo;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.TokenVo;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.User;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 用户聚合
 */
@AllArgsConstructor
public class UserAggImpl implements UserAgg {
    private Account account;
    private TokenVo token;
    private User user;

    @Override
    public void handleRegister(UserRegisterCommand command) {
        var now = OffsetDateTime.now();
        if (this.user != null) {
            var reason = "该用户名已存在";
            DomainEventPublisher.getInstance().publishEvent(new UserRegisterFailedEvent(command.ip(), reason, now));
            throw new DomainBusinessException(reason);
        } else if (account != null) {
            var reason = "该账号已存在（目前不支持一个账号，多个用户）";
            DomainEventPublisher.getInstance().publishEvent(new UserRegisterFailedEvent(command.ip(), reason, now));
            throw new DomainBusinessException(reason);
        }
        var encoder = PasswordEncoder.getInstance();
        var userId = UserRepo.getInstance().nextUserId();
        var accountId = UserRepo.getInstance().nextAccountId();
        var encryptedPassword = new PasswordVo(encoder.encode(command.password().value()), true);
        this.account = Account.builder()
                .id(accountId)
                .password(encryptedPassword)
                .email(command.email())
                .phone(command.phone())
                .createTime(now)
                .updateTime(now)
                .build();
        this.user = User.builder()
                .id(userId)
                .username(command.username())
                .createTime(now)
                .updateTime(now)
                .build();
        DomainEventPublisher.getInstance()
                .publishEvent(new UserRegisterSucceededEvent(userId, command.username(), now, command.ip()));
    }

    @Override
    public void handleLogin(UserLoginCommand command) {
        var now = OffsetDateTime.now();
        if (this.user == null) {
            var reason = "用户不存在";
            DomainEventPublisher.getInstance().publishEvent(new UserLoginFailedEvent(null, command.username(), reason, now, command.ip()));
            throw new DomainBusinessException(reason);
        }
        var encoder = PasswordEncoder.getInstance();
        if (!encoder.matches(command.password().value(), this.account.password().value())) {
            var reason = "密码不正确";
            DomainEventPublisher.getInstance().publishEvent(new UserLoginFailedEvent(this.user.id(), this.user.username(), reason, now, command.ip()));
            throw new DomainBusinessException(reason);
        }
        this.token = UserRepo.getInstance().createToken(this.user.id());
        DomainEventPublisher.getInstance().publishEvent(new UserLoginSucceededEvent(this.user.id(), this.user.username(), now, command.ip()));
    }

    @Override
    public void handleUpdateInfo(UserUpdateInfoCommand command) {
        if (this.user == null) {
            throw new DomainBusinessException("用户不存在");
        }
        var now = OffsetDateTime.now();
        this.account = this.account.toBuilder()
                .email(command.email())
                .phone(command.phone())
                .updateTime(now)
                .build();
        this.user = this.user.toBuilder()
                .nickname(command.nickname())
                .phone(command.phone())
                .updateTime(now)
                .build();
        DomainEventPublisher.getInstance().publishEvent(new UserUpdateInfoSucceededEvent(this.user.id(), command.username(), now));
    }

    @Override
    public void handleLogout(UserLogoutCommand command) {
        this.token = null;
    }

    @Override
    public TokenVo handleRefreshToken(UserRefreshTokenCommand command) {
        if (user == null) {
            throw new DomainBusinessException("用户不存在");
        } else if (this.token == null) {
            throw new DomainBusinessException("用户未登录");
        }
        this.token = UserRepo.getInstance().refreshToken(command.userId(), token);
        return this.token;
    }

    @Override
    public void handleUpdatePassword(UserUpdatePasswordCommand command) {
        var encoder = PasswordEncoder.getInstance();
        if (!encoder.matches(command.oldPassword().value(), this.account.password().value())) {
            throw new DomainBusinessException("旧密码不正确");
        }
        this.account = this.account.toBuilder()
                .password(new PasswordVo(encoder.encode(command.newPassword().value()), true))
                .updateTime(OffsetDateTime.now())
                .build();
    }

    public boolean hasLogin() {
        return token != null && PasswordEncoder.getInstance().isValid(account.password().value());
    }
}
"#.into()
}

pub fn class_demo2() -> String {
    r#"package com.github.alphafoxz.oneboot.sdk.service.version;

import com.github.alphafoxz.oneboot.core.toolkit.coding.FileUtil;
import com.github.alphafoxz.oneboot.sdk.SdkConstants;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class SdkVersionStoreService {
    private final GenRestful genRestfulPart = new GenRestful();

    public static class GenRestful implements VersionStore {
        private final File file = FileUtil.file(SdkConstants.SDK_VERSION_PATH + File.separator + "sdk_gen.json");

        {
            init();
        }

        @Override
        @NonNull
        public File getFile() {
            return file;
        }
    }

    public GenRestful genRestfulStore() {
        return genRestfulPart;
    }
}
"#.into()
}

pub fn class_demo3() -> String {
    r#"package com.github.alphafoxz.oneboot.sdk.controller;

import com.github.alphafoxz.oneboot.sdk.gen.restl.apis.SdkGenCodeApi;
import com.github.alphafoxz.oneboot.sdk.service.gen.SdkGenCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SdkGenCodeController implements SdkGenCodeApi {
    private final SdkGenCrudService sdkGenCrudService;

    @Override
    public ResponseEntity<?> generateTableCrud(String moduleName, String poName, Integer serviceType, Boolean force) {
        sdkGenCrudService.generateTableCrud(moduleName, poName, serviceType, force);
        return ResponseEntity.ok(null);
    }

    @Override
    public ResponseEntity<?> generateModuleCrud(String moduleName, Integer serviceType, Boolean force) {
        sdkGenCrudService.generateModuleCrud(moduleName, serviceType, force);
        return ResponseEntity.ok(null);
    }
}
"#.into()
}

pub fn class_demo4() -> String {
    r#"package com.github.alphafoxz.oneboot.sdk.controller;

import com.github.alphafoxz.oneboot.core.toolkit.coding.FileUtil;
import com.github.alphafoxz.oneboot.sdk.gen.restl.apis.SdkGenDocApi;
import com.github.alphafoxz.oneboot.sdk.service.gen.SdkGenDocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
@RequiredArgsConstructor
public class SdkGenDocController implements SdkGenDocApi {
    private final SdkGenDocService sdkGenDocService;

    @Override
    public ResponseEntity<byte[]> generateWordApi(String moduleName) {
        File file = sdkGenDocService.generateWordApi(moduleName);
        String fileName = moduleName + "模块Api文档.docx";
        return U.fileBodyBuilder(OK_200, fileName)
                .body(FileUtil.readBytes(file));
    }
}
"#
    .into()
}

pub fn record_demo1() -> String {
    r#"package com.github.alphafoxz.oneboot.domain.preset_sys.user.vo;


import com.github.alphafoxz.oneboot.core.domain.DomainArgCheckException;
import com.github.alphafoxz.oneboot.core.toolkit.coding.ReUtil;

/**
 * 电子邮箱
 */
public record EmailVo(String value) {
    public EmailVo {
        if (!ReUtil.isMatch("\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}", value)) {
            throw new DomainArgCheckException("电子邮箱格式不正确");
        }
    }
}//end Email"#
        .into()
}

pub fn interface_demo1() -> String {
    r#"package com.github.alphafoxz.oneboot.domain.preset_sys.user;

import com.github.alphafoxz.oneboot.core.toolkit.coding.SpringUtil;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.TokenVo;
import com.github.alphafoxz.oneboot.domain.preset_sys.user.vo.UsernameVo;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

public interface UserRepo {
    static String s = "";

    public static UserRepo getInstance() {
        if (Instance.VALUE == null) {
            Instance.VALUE = SpringUtil.getBean(UserRepo.class);
        }
        return Instance.VALUE;
    }

    class Instance {
        private static UserRepo VALUE = null;
    }

    public static void setInstance(UserRepo instance) {
        if (Instance.VALUE != null) {
            throw new RuntimeException("Instance already exists");
        }
        Instance.VALUE = instance;
    }

    @Nonnull
    UserAgg findBySubjectId(UsernameVo username);

    @Nonnull
    UserAgg findById(Long userId);

    @Nonnull
    UserAgg findByUsername(UsernameVo username);

    @Nonnull
    TokenVo createToken(Long userId);

    @Nullable
    TokenVo refreshToken(Long userId, TokenVo oldToken);

    void save(UserAgg user);

    @Nonnull
    Long nextUserId();

    @Nonnull
    Long nextAccountId();


}

"#
    .into()
}

pub fn interface_demo2() -> String {
    r#"package com.github.alphafoxz.oneboot.sdk.service.version;

import cn.hutool.json.JSON;
import com.github.alphafoxz.oneboot.core.CoreConstants;
import com.github.alphafoxz.oneboot.core.toolkit.coding.FileUtil;
import com.github.alphafoxz.oneboot.core.toolkit.coding.JSONUtil;
import org.springframework.lang.NonNull;

import java.io.File;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.util.TreeMap;

public interface VersionStore {
    @NonNull
    public File getFile();

    default public void init() {
        File file = getFile();
        FileUtil.mkParentDirs(file);
        if (!file.exists()) {
            FileUtil.writeUtf8String(CoreConstants.EMPTY_JSON_OBJ, file);
        }
    }

    @SuppressWarnings("unchecked")
    default public TreeMap<String, Serializable> readFile() {
        JSON json = JSONUtil.readJSON(getFile(), StandardCharsets.UTF_8);
        return json.toBean(TreeMap.class);
    }

    default public void writeFile(TreeMap<String, Serializable> content) {
        FileUtil.writeUtf8String(JSONUtil.toJsonPrettyStr(content), getFile());
    }

    default public void writeFile(String key, Serializable value) {
        TreeMap<String, Serializable> map = readFile();
        map.put(key, value);
        FileUtil.writeUtf8String(JSONUtil.toJsonPrettyStr(map), getFile());
    }
}
"#
    .into()
}

pub fn interface_demo3() -> String {
    r#"package com.github.alphafoxz.oneboot.sdk.gen.restl.apis;

import com.github.alphafoxz.oneboot.core.standard.service.HttpController;
import com.github.alphafoxz.oneboot.sdk.gen.restl.enums.SdkCrudServiceTypeEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping({"/_sdk/genCode"})
@Tag(name = "SdkGenCodeApi", description = "Sdk模块代码生成接口")
public interface SdkGenCodeApi extends HttpController {
    /**
     * @param serviceType 枚举值
     * @see SdkCrudServiceTypeEnum
     */
    @GetMapping(value = {"/generateTableCrud"})
    @Operation(summary = "创建单表CRUD代码", responses = {

            @ApiResponse(description = "无权限", responseCode = "403", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(description = "参数无效", responseCode = "400", content = @Content(schema = @Schema(hidden = true))),
    })
    public ResponseEntity<?> generateTableCrud(
            @Parameter(description = "模块名称") @RequestParam String moduleName,
            @Parameter(description = "表名") @RequestParam String poName,
            @Parameter(description = "生成类型") @RequestParam Integer serviceType,
            @Parameter(description = "是否覆盖已有代码") @RequestParam Boolean force
    );

    /**
     * @param serviceType 枚举值
     * @see SdkCrudServiceTypeEnum
     */
    @GetMapping(value = {"/generateModuleCrud"})
    @Operation(summary = "创建整个模块的CRUD代码", responses = {
            @ApiResponse(description = "请求成功", responseCode = "200", content = @Content(mediaType = "application/json", schema = @Schema(implementation = String.class))),
            @ApiResponse(description = "无权限", responseCode = "403", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(description = "参数无效", responseCode = "400", content = @Content(schema = @Schema(hidden = true))),
    })
    public ResponseEntity<?> generateModuleCrud(
            @Parameter(description = "模块名称") @RequestParam String moduleName,
            @Parameter(description = "生成类型") @RequestParam Integer serviceType,
            @Parameter(description = "是否覆盖已有代码") @RequestParam Boolean force
    );

}"#.into()
}
