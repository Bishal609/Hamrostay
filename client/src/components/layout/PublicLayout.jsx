import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ChatWidget from "../chat/ChatWidget";
import useAuthStore from "../../store/authStore";

export default function PublicLayout() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      {isAuthenticated() && <ChatWidget />}
    </div>
  );
}