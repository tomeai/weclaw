import LayoutApp from "@/components/layout/layout-app"
import { APP_DOMAIN, APP_NAME } from "@/lib/config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `隐私政策 - ${APP_NAME}`,
  description: `${APP_NAME} 隐私政策 - 了解我们如何收集、使用和保护您的个人信息。`,
}

export default function PrivacyPage() {
  const lastUpdated = "2025年1月1日"

  return (
    <LayoutApp>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            隐私政策
          </h1>
          <p className="mt-3 text-muted-foreground">最后更新：{lastUpdated}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-foreground">
          <section>
            <p className="text-muted-foreground leading-relaxed">
              欢迎使用 {APP_NAME}（以下简称"我们"或"本平台"）。我们深知个人信息对您的重要性，并将尽全力保护您的个人信息安全。本隐私政策说明了我们在您使用{" "}
              <span className="font-medium">{APP_DOMAIN}</span>{" "}
              及相关服务时如何收集、使用、存储和保护您的信息。请您仔细阅读本政策，如果您不同意本政策的任何内容，请停止使用我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. 我们收集的信息
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>根据您使用我们服务的方式，我们可能收集以下类型的信息：</p>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  1.1 您主动提供的信息
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>账户注册信息：电子邮件地址、用户名、密码</li>
                  <li>第三方登录信息：通过 GitHub、Google 等第三方平台授权登录时获取的基本信息</li>
                  <li>用户内容：您在平台上创建的 Agent、配置信息、对话记录、上传的文件</li>
                  <li>反馈信息：您提交的问题报告、功能建议等</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  1.2 自动收集的信息
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>设备信息：IP 地址、浏览器类型、操作系统版本</li>
                  <li>使用数据：页面访问记录、功能使用情况、API 调用日志</li>
                  <li>Cookie 及类似技术：用于维持登录状态和改善用户体验</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. 信息的使用方式
            </h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>我们将收集的信息用于以下目的：</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>提供、维护和改进我们的服务</li>
                <li>处理您的请求并提供技术支持</li>
                <li>发送服务通知、更新和安全提醒</li>
                <li>分析平台使用情况以优化用户体验</li>
                <li>检测、调查和防范欺诈及安全威胁</li>
                <li>遵守适用的法律法规要求</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. 信息的共享与披露
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                我们不会出售、出租或交易您的个人信息。在以下情况下，我们可能共享您的信息：
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <span className="font-medium text-foreground">服务提供商：</span>
                  与协助我们运营平台的受信任第三方共享，如云服务商、AI 模型提供商，这些方受保密协议约束
                </li>
                <li>
                  <span className="font-medium text-foreground">法律要求：</span>
                  当法律要求或为响应政府机构的合法请求时
                </li>
                <li>
                  <span className="font-medium text-foreground">安全保护：</span>
                  为保护 {APP_NAME}、用户或公众的权利、财产或安全
                </li>
                <li>
                  <span className="font-medium text-foreground">业务转让：</span>
                  在公司合并、收购或资产出售的情况下，我们将提前通知您
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. 数据安全
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们采用行业标准的安全措施保护您的信息，包括数据加密传输（HTTPS）、访问控制和定期安全审计。然而，互联网传输并非完全安全，我们无法保证信息传输的绝对安全性。请您妥善保管账户密码，不要将账户凭据分享给他人。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. 数据留存
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们将在您使用服务期间及之后合理必要的时间内保留您的信息，以满足本政策所述目的及遵守法律义务。您可以随时删除您的账户，删除后我们将在合理期限内删除您的个人信息，但法律法规要求保留的除外。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Cookie 的使用
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们使用 Cookie 和类似追踪技术来维持您的登录状态、记住您的偏好设置，并分析平台使用情况。您可以通过浏览器设置禁用 Cookie，但这可能影响某些功能的正常使用。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. 第三方服务
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们的平台集成了第三方 MCP 工具和 AI 模型服务。当您使用这些服务时，您的相关数据可能会被传输至第三方服务提供商。我们建议您查阅相关第三方的隐私政策以了解其数据处理方式。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. 未成年人保护
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们的服务不面向 16 岁以下的未成年人。如果我们发现在未获得可证实的父母同意的情况下收集了未成年人的信息，我们将采取措施删除该信息。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. 您的权利
            </h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>您对自己的个人信息享有以下权利：</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>访问权：获取我们持有的您的个人信息副本</li>
                <li>更正权：更正不准确或不完整的个人信息</li>
                <li>删除权：在特定情况下要求删除您的个人信息</li>
                <li>限制处理权：在特定情况下限制我们处理您的信息</li>
                <li>数据可携带权：以结构化格式获取您的数据</li>
                <li>撤回同意权：随时撤回您之前给予的同意</li>
              </ul>
              <p className="mt-3">
                如需行使上述权利，请通过下方联系方式与我们联系。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. 政策更新
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们可能不时更新本隐私政策。重大变更时，我们将通过电子邮件或平台公告通知您。我们建议您定期查阅本政策以了解最新内容。继续使用我们的服务即表示您接受更新后的政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. 联系我们
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              如果您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：
            </p>
            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">项目地址：</span>{" "}
                <a
                  href="https://github.com/tomeai/wemcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  github.com/tomeai/wemcp
                </a>
              </p>
              <p className="mt-1">
                <span className="font-medium text-foreground">官方网站：</span>{" "}
                <a
                  href={APP_DOMAIN}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {APP_DOMAIN}
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </LayoutApp>
  )
}
