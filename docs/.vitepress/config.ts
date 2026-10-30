import { defineConfig, type DefaultTheme } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons'

const repo = 'https://github.com/BM-Hospital/bm-electron-vite'
const version = 'v6.0.0'

// Page paths shared by both locales; Vietnamese pages live under /vi/
const guidePages: [en: string, vi: string, link: string][] = [
  ['Getting Started', 'Bắt đầu', 'guide/'],
  ['CLI', 'CLI', 'guide/cli'],
  ['Development', 'Phát triển', 'guide/dev'],
  ['Asset Handling', 'Xử lý asset', 'guide/assets'],
  ['HMR and Hot Reloading', 'HMR và hot reloading', 'guide/hmr-and-hot-reloading'],
  ['TypeScript', 'TypeScript', 'guide/typescript'],
  ['Building for Production', 'Build cho production', 'guide/build'],
  ['Dependency Handling', 'Xử lý dependency', 'guide/dependency-handling'],
  ['Isolated Build', 'Build tách biệt', 'guide/isolated-build'],
  ['Source Code Protection', 'Bảo vệ mã nguồn', 'guide/source-code-protection'],
  ['Distribution', 'Đóng gói và phân phối', 'guide/distribution'],
  ['Env Variables and Modes', 'Biến môi trường và mode', 'guide/env-and-mode'],
  ['Debugging', 'Debug', 'guide/debugging'],
  ['Troubleshooting', 'Xử lý sự cố', 'guide/troubleshooting'],
  ['Migration from v4', 'Nâng cấp từ v4', 'guide/migration']
]

function sidebar(lang: 'en' | 'vi'): DefaultTheme.SidebarItem[] {
  const base = lang === 'en' ? '/' : '/vi/'
  const vi = lang === 'vi'
  return [
    {
      text: vi ? 'Hướng dẫn' : 'Guide',
      items: guidePages.map(([en, viText, link]) => ({ text: vi ? viText : en, link: base + link }))
    },
    {
      text: vi ? 'Cấu hình' : 'Config',
      items: [{ text: vi ? 'Tham chiếu cấu hình' : 'Config Reference', link: base + 'config/' }]
    },
    {
      text: 'API',
      items: [{ text: vi ? 'Tham chiếu API' : 'API Reference', link: base + 'api/' }]
    }
  ]
}

function nav(lang: 'en' | 'vi'): DefaultTheme.NavItem[] {
  const base = lang === 'en' ? '/' : '/vi/'
  const vi = lang === 'vi'
  return [
    { text: vi ? 'Hướng dẫn' : 'Guide', link: base + 'guide/', activeMatch: `^${base}(guide|api)/` },
    { text: vi ? 'Cấu hình' : 'Config', link: base + 'config/', activeMatch: `^${base}config/` },
    // The blog is English only
    { text: 'Blog', link: '/blog/', activeMatch: '^/blog/' },
    {
      text: vi ? 'Liên kết' : 'Links',
      items: [
        {
          items: [
            { text: 'Vite', link: 'https://vitejs.dev/' },
            {
              text: 'create-electron',
              link: 'https://github.com/alex8088/quick-start/tree/master/packages/create-electron'
            },
            { text: 'electron-vite (upstream)', link: 'https://electron-vite.org' }
          ]
        }
      ]
    },
    {
      text: version,
      items: [{ text: vi ? 'Lịch sử thay đổi' : 'Changelog', link: `${repo}/blob/master/CHANGELOG.md` }]
    }
  ]
}

export default defineConfig({
  title: 'bm-electron-vite',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/favicon.png', type: 'image/png' }]
  ],
  srcDir: 'docs',
  srcExclude: ['**/v2.md'],
  lastUpdated: true,
  cleanUrls: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'Next generation Electron build tooling based on Vite.',
      themeConfig: {
        nav: nav('en'),
        sidebar: { '/': sidebar('en') }
      }
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi-VN',
      description: 'Công cụ build Electron thế hệ mới dựa trên Vite.',
      themeConfig: {
        nav: nav('vi'),
        sidebar: { '/vi/': sidebar('vi') },
        outline: { label: 'Trên trang này' },
        docFooter: { prev: 'Trang trước', next: 'Trang sau' },
        lastUpdated: { text: 'Cập nhật lần cuối' },
        returnToTopLabel: 'Về đầu trang',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Giao diện',
        lightModeSwitchTitle: 'Chuyển sang giao diện sáng',
        darkModeSwitchTitle: 'Chuyển sang giao diện tối',
        langMenuLabel: 'Đổi ngôn ngữ',
        notFound: {
          title: 'KHÔNG TÌM THẤY TRANG',
          quote: 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.',
          linkText: 'Về trang chủ'
        },
        footer: {
          message: 'Phát hành theo giấy phép MIT',
          copyright: 'Copyright © 2022-present Alex Wei & Powered by Vite'
        }
      }
    }
  },
  themeConfig: {
    logo: '/favicon.svg',
    search: {
      provider: 'local',
      options: {
        locales: {
          vi: {
            translations: {
              button: { buttonText: 'Tìm kiếm', buttonAriaLabel: 'Tìm kiếm' },
              modal: {
                displayDetails: 'Hiện chi tiết',
                resetButtonTitle: 'Xoá tìm kiếm',
                backButtonTitle: 'Đóng tìm kiếm',
                noResultsText: 'Không có kết quả cho',
                footer: { selectText: 'chọn', navigateText: 'di chuyển', closeText: 'đóng' }
              }
            }
          }
        }
      }
    },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2022-present Alex Wei & Powered by Vite'
    }
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          'electron.vite': localIconLoader(import.meta.url, '../docs/public/favicon.svg')
        }
      })
    ]
  }
})
