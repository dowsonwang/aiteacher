import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import BrowseHome from "./pages/BrowseHome.jsx";
import Feed from "./pages/Feed.jsx";
import Shorts from "./pages/Shorts.jsx";
import ShortDetail from "./pages/ShortDetail.jsx";
import Favorites from "./pages/Favorites.jsx";
import CreateEntry from "./pages/CreateEntry.jsx";
import CreateModeSelect from "./pages/CreateModeSelect.jsx";
import CreateNormal from "./pages/CreateNormal.jsx";
import CreateVip from "./pages/CreateVip.jsx";
import Chat from "./pages/Chat.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import Subscribe from "./pages/Subscribe.jsx";
import SubscriptionManagement from "./pages/SubscriptionManagement.jsx";
import LiveRoom from "./pages/LiveRoom.jsx";
import LiveList from "./pages/LiveList.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import FAQ from "./pages/FAQ.jsx";
import Article from "./pages/Article.jsx";
import Blog from "./pages/Blog.jsx";
import Account from "./pages/Account.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/browse" replace />} />
          <Route path="browse" element={<BrowseHome />} />
          <Route path="feed" element={<Feed />} />
          <Route path="shorts" element={<Shorts />} />
          <Route path="shorts/:id" element={<ShortDetail />} />
          <Route path="create" element={<CreateEntry />}>
            <Route index element={<CreateModeSelect />} />
            <Route path="normal" element={<CreateNormal />} />
            <Route path="vip" element={<CreateVip />} />
          </Route>
          <Route path="chat" element={<Chat />}>
            <Route path=":id" element={<ChatRoom />} />
          </Route>
          <Route path="favorites" element={<Favorites />} />
          <Route path="subscribe" element={<Subscribe />} />
          <Route path="subscription" element={<SubscriptionManagement />} />
          <Route path="live" element={<LiveList />} />
          <Route path="live/:id" element={<LiveRoom />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="articles/:slug" element={<Article />} />
          <Route path="blog" element={<Blog />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
