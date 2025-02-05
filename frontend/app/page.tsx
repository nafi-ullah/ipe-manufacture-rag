"use client";

import { BACKEND_URL } from "@/utils/constants";
import { useEffect, useState } from "react";

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
      .then((data) => setSelectedProduct(data))
      .catch((err) => console.error("Error fetching product details:", err));
  };

  // Handle sending chat input
  const handleSendChat = async () => {
    if (!selectedProduct || !chatInput.trim()) return;

    const payload = {
      prompt: chatInput,
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
        setChatInput(""); // Clear input field
        fetchProductDetails(selectedProduct.product_id); // Reload product details
      } else {
        console.error("Failed to update chat.");
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <aside className="w-1/5 bg-[#DCD6F7] p-4 shadow-md">
        <h2 className="text-lg font-semibold text-[#424874] mb-4">Products</h2>
        <ul className="space-y-2">
          {productIds.map((id, index) => (
            <li
              key={id}
              className="p-3 bg-[#A6B1E1] text-white rounded-lg cursor-pointer hover:bg-[#424874] transition duration-300"
              onClick={() => fetchProductDetails(id)}
            >
              Item {productIds.length - index}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Content */}
      <main className="flex-1 p-6 bg-[#F8F8F8]">
        {selectedProduct ? (
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-[#424874] mb-2">
              {selectedProduct.product_name}
            </h2>
            <p className="text-gray-600 mb-4">
              Captured at: {new Date(selectedProduct.capture_time).toLocaleString()}
            </p>
            <img
              src={selectedProduct.image_url}
              alt="Product"
              className="w-full max-h-60 object-cover rounded-lg mb-4"
            />

            {/* Chat History */}
            <div className="bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto">
              {selectedProduct.chat_history.map((chat, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg ${
                    chat.role === "human"
                      ? "bg-[#DCD6F7] text-black self-end"
                      : "bg-[#A6B1E1] text-white self-start"
                  }`}
                >
                  <p className="text-sm">
                    <strong>{chat.role === "human" ? "You" : "AI"}:</strong> {chat.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="mt-4 flex">
              <input
                type="text"
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] text-black"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                onClick={handleSendChat}
                className="bg-[#424874] text-white px-4 py-2 rounded-r-lg hover:bg-black transition duration-300"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-lg">Select a product to view details.</p>
        )}
      </main>
    </div>
  );
}
