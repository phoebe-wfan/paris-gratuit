import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'巴黎葛朗台 · Paris Gratuit',description:'发现巴黎免费展览、体育赛事、Pop-up 与其他活动，关注感兴趣的场馆和预约信息。',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
