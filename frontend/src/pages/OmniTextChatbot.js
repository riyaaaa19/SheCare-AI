import React, { useEffect } from "react";

const OmniTextChatbot = () => {
  useEffect(() => {
    if (!document.getElementById("omnidimension-web-widget")) {
      const script = document.createElement("script");
      script.id = "omnidimension-web-widget";
      script.async = true;
      script.src = "https://backend.omnidim.io/web_widget.js?secret_key=ea876da925a2910ce1f4c6ef99a89f9b";
      document.body.appendChild(script);
    }
  }, []);

  return null; // Widget will appear automatically as a floating chat
};

export default OmniTextChatbot;