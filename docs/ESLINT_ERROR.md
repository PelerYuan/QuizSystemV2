## 前端依赖安装冲突总结（ESLint / npm audit / npm ci）

### 现象

在 `frontend` 目录执行 `npm install` 或 `npm ci` 时出现依赖解析失败（ERESOLVE），核心报错指向：

- `eslint-plugin-react-hooks@7.0.1` 的 peer 依赖不接受 `eslint@10.x`
- 项目曾安装/升级到 `eslint@10.0.1` 后，与 `eslint-plugin-react-hooks@7.0.1` 产生冲突

同时，`npm audit` 报告存在高危漏洞：

- `minimatch < 10.2.1`（ReDoS / DoS 风险），漏洞来源在 ESLint 相关依赖链中（`@eslint/config-array` / `@eslint/eslintrc` 等间接依赖）。

### 根因

1. **ESLint 生态版本不一致**
   - `eslint-plugin-react-hooks@7.0.1` 当前 peer 依赖范围只到 `eslint@9.x`，不包含 `eslint@10.x`。
   - 当 ESLint 被升级到 10（例如通过 `npm audit fix --force`），npm 会检测到 peer 不兼容并在严格模式下阻止安装（尤其 `npm ci` 更严格）。
2. **`npm audit fix --force` 会引入“破坏性升级”**
   - 为了修复 `minimatch` 漏洞，`npm audit fix --force` 会把 ESLint 升到 10.x。
   - 这会导致依赖树出现 “peer 不匹配”，在部分环境下可“勉强安装”，但会使 `npm ci` 等严格安装方式失败，影响多人协作与 CI。

### 风险评估

- `minimatch` 漏洞位于 **开发工具链（ESLint）** 的依赖路径，通常不影响前端运行时（页面启动、打包、上线产物）。
- 真正影响协作稳定性的点是：**peer 冲突导致不同机器/CI 安装行为不一致**（有人能装、有人装不上）。

------

## 暂时解决方法（当前推荐做法）

### 目标：多人协作/CI 可复现、安装稳定

1. **将 ESLint 固定在 9.x（回退/锁定）**
   - 使 `eslint-plugin-react-hooks@7.0.1` 的 peer 依赖满足要求
   - 避免 `npm ci` 失败
2. **保留并提交 `package-lock.json`**
   - 团队统一使用 `npm ci` 安装，确保依赖版本一致、可复现
3. **团队安装/运行指引**
   - 在 `frontend/` 目录执行：
     - `npm ci`
     - `npm run dev`
     - `npm run lint`（可选）

> 备注：此方案可能会重新出现 `npm audit` 对 `minimatch` 的高危提示，但它属于 dev 工具链风险；上线/生产构建时可通过不安装 devDependencies 来降低暴露面。

------

## 部署/上线建议（降低 dev 漏洞影响）

- 生产环境（或构建环境）优先使用：
  - `npm ci --omit=dev`
- 避免在生产环境安装 ESLint 等 devDependencies，从根源上不引入该漏洞链。

------

## 后续计划（长期方案）

- 等待 `eslint-plugin-react-hooks` 更新并正式支持 ESLint 10 后，再考虑升级到 ESLint 10，以同时满足：
  - `npm ci` 严格可安装
  - `npm audit` 漏洞清零
- 或在需要“audit 必须为 0”的场景下，临时移除/替换冲突的 ESLint 插件组合（以兼容 ESLint 10）。