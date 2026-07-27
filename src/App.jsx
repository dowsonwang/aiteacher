import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import BrowseHome from "./pages/BrowseHome.jsx";
import Feed from "./pages/Feed.jsx";
import Shorts from "./pages/Shorts.jsx";
import ShortDetail from "./pages/ShortStoryDetail.jsx";
import ShortStoryOverview from "./pages/ShortStoryOverview.jsx";
import Favorites from "./pages/Favorites.jsx";
import Create from "./pages/Create.jsx";
import CreateRecordDetail from "./pages/CreateRecordDetail.jsx";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/browse" replace /> },
      { path: "browse", element: <BrowseHome /> },
      { path: "feed", element: <Feed /> },
      { path: "shorts", element: <Shorts /> },
      { path: "shorts/:id/about", element: <ShortStoryOverview /> },
      { path: "shorts/:id", element: <ShortDetail /> },
      { path: "create", element: <Create /> },
      { path: "create/record/:id", element: <CreateRecordDetail /> },
      {
        path: "chat",
        element: <Chat />,
        children: [{ path: ":id", element: <ChatRoom /> }],
      },
      { path: "favorites", element: <Favorites /> },
      { path: "subscribe", element: <Subscribe /> },
      { path: "subscription", element: <SubscriptionManagement /> },
      { path: "live", element: <LiveList /> },
      { path: "live/:id", element: <LiveRoom /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "faq", element: <FAQ /> },
      { path: "articles/:slug", element: <Article /> },
      { path: "blog", element: <Blog /> },
      { path: "account", element: <Account /> },
      { path: "*", element: <Navigate to="/browse" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
