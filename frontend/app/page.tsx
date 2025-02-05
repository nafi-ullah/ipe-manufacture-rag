"use client";

import { BACKEND_URL } from "@/utils/constants";
import { useEffect, useState } from "react";
import { FiBox, FiMenu, FiSend, FiUser } from "react-icons/fi";
import { MdSmartToy } from "react-icons/md";
import ReactMarkdown from "react-markdown";
interface Product {
  product_name: string;
  capture_time: string;
  solution: any[];
  image_url: string;
  product_id: string;
  chat_history: { role: string; content: string }[];
  relevant_machines: any[];
}

export default function Page() {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [humanMessages, setHumanMessages] = useState<string[]>([]);
  const [assistantMessages, setAssistantMessages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch product IDs on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/get_product_ids/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product_ids) {
          setProductIds(data.product_ids.reverse()); // Show in descending order
        }
      })
      .catch((err) => console.error("Error fetching product IDs:", err));
  }, []);

  // Fetch product details
  const fetchProductDetails = (productId: string) => {
    fetch(`${BACKEND_URL}/get_product/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedProduct(data);

        // Extract messages into separate arrays
        const humanMsgs: string[] = [];
        const assistantMsgs: string[] = [];

        data.chat_history.forEach((chat: any) => {
          if (chat.role === "human") humanMsgs.push(chat.content);
          else if (chat.role === "assistant") assistantMsgs.push(chat.content);
        });

        setHumanMessages(humanMsgs);
        setAssistantMessages(assistantMsgs);
      })
      .catch((err) => console.error("Error fetching product details:", err));
  };

  // Handle sending chat input
  const handleSendChat = async () => {
    if (!selectedProduct || !chatInput.trim()) return;

    const newMessage = chatInput;
    setChatInput(""); // Clear input field
    setIsTyping(true); // Show typing loader
    setHumanMessages((prev) => [...prev, newMessage]); // Push human message

    const payload = {
      prompt: newMessage,
      response: "Processing...", // Placeholder for now
    };

    try {
      const response = await fetch(
        `${BACKEND_URL}/update_product_chat/${selectedProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const latestChatHistory = data.product.chat_history;
        const lastAssistantMessage = latestChatHistory[latestChatHistory.length - 1];

        if (lastAssistantMessage.role === "assistant") {
          setAssistantMessages((prev) => [...prev, lastAssistantMessage.content]);
        }
      } else {
        console.error("Failed to update chat.");
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-indigo-600 text-white">
        <h1 className="text-xl font-bold">Products</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={24} />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`bg-indigo-50 p-4 shadow-md md:shadow-none md:w-1/4 lg:w-1/5 transition-transform duration-300 
          ${isSidebarOpen ? "translate-x-0" : "translate-x-[-100%] md:translate-x-0"} 
          absolute md:relative top-0 left-0 h-full z-20`}
      >
        <h2 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
          <FiBox className="mr-2" /> Products
        </h2>
        <ul className="space-y-2">
          {productIds.map((id, index) => (
            <li
              key={id}
              className="p-3 bg-white text-indigo-900 rounded-lg cursor-pointer hover:bg-indigo-100 transition duration-300 flex items-center"
              onClick={() => {
                fetchProductDetails(id);
                setIsSidebarOpen(false); // Close sidebar on mobile after selection
              }}
            >
              <FiBox className="mr-2" /> Item {productIds.length - index}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 lg:ml-4">
        {selectedProduct ? (
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-indigo-800 mb-2">
                  {selectedProduct.product_name}
                </h2>
                <p className="text-gray-600">
                  Captured at:{" "}
                  {new Date(selectedProduct.capture_time).toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={selectedProduct.image_url}
                  alt="Product"
                  className="w-full  object-cover rounded-lg md:w-96"
                />
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-gray-100 p-4 rounded-lg mt-6 max-h-96 overflow-y-auto space-y-4 min-h-[50vh]">
              {humanMessages.map((msg, index) => (
                <div key={index}>
                  <div className="flex items-start space-x-2">
                    <FiUser className="mt-1 text-indigo-600" size={20} />
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-900">
                      <strong>You:</strong> {msg}
                    </div>
                  </div>
                  {assistantMessages[index] && (
                    <div className="flex items-start space-x-2 mt-2">
                      <MdSmartToy className="mt-1 text-gray-600" size={20} />
                      <div className="bg-gray-200 p-3 rounded-lg text-gray-800">
                        <strong>AI:</strong> <ReactMarkdown>
                          {assistantMessages[index]}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-2">
                  <MdSmartToy className="mt-1 text-gray-600" size={20} />
                  <div className="bg-gray-200 p-3 rounded-lg text-gray-800">
                    <strong>AI:</strong> Typing...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="mt-4 flex">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                onClick={handleSendChat}
                className="bg-indigo-600 text-white px-5 py-3 rounded-r-lg hover:bg-indigo-700 transition duration-300 flex items-center"
              >
                <FiSend className="mr-2" size={20} /> Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">
              Select a product to view details.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
