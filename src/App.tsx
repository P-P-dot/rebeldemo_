"use client"

import React, { useEffect, useState } from "react"
import "./App.css"
import { RetellWebClient } from "retell-client-js-sdk"

const agentId = "agent_d7e4c70e26ebfba081962b117d"

interface RegisterCallResponse {
  access_token: string
}

const retellWebClient = new RetellWebClient()

const App = () => {
  const [isCalling, setIsCalling] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle")
  const [isAgentTalking, setIsAgentTalking] = useState(false)

  // Initialize the SDK
  useEffect(() => {
    retellWebClient.on("call_started", () => {
      console.log("call started")
      setCallStatus("active")
    })

    retellWebClient.on("call_ended", () => {
      console.log("call ended")
      setIsCalling(false)
      setCallStatus("ended")
      setIsAgentTalking(false)
    })

    retellWebClient.on("agent_start_talking", () => {
      console.log("agent_start_talking")
      setIsAgentTalking(true)
    })

    retellWebClient.on("agent_stop_talking", () => {
      console.log("agent_stop_talking")
      setIsAgentTalking(false)
    })

    retellWebClient.on("audio", (audio) => {
      // console.log(audio);
    })

    retellWebClient.on("update", (update) => {
      // console.log(update);
    })

    retellWebClient.on("metadata", (metadata) => {
      // console.log(metadata);
    })

    retellWebClient.on("error", (error) => {
      console.error("An error occurred:", error)
      retellWebClient.stopCall()
      setCallStatus("ended")
      setIsCalling(false)
    })
  }, [])

  const toggleConversation = async () => {
    if (isCalling) {
      retellWebClient.stopCall()
    } else {
      setCallStatus("connecting")
      const registerCallResponse = await registerCall(agentId)
      if (registerCallResponse.access_token) {
        retellWebClient
          .startCall({
            accessToken: registerCallResponse.access_token,
          })
          .catch(console.error)
        setIsCalling(true)
      }
    }
  }

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    try {
      const response = await fetch("https://rebel-demo-backend.onrender.com/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data: RegisterCallResponse = await response.json()
      return data
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Conectando"
      case "active":
        return "Llamada Activa"
      case "ended":
        return "Terminada"
      default:
        return "Llamar"
    }
  }

  const getStatusColor = () => {
    switch (callStatus) {
      case "connecting":
        return "#fbbf24" // yellow
      case "active":
        return "#10b981" // green
      case "ended":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="title">Habla con tu tutor Rebel</h1>

        <div className="status-container">
          <div className="status-dot" style={{ backgroundColor: getStatusColor() }}></div>
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="waveform-container">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`waveform-bar ${isAgentTalking ? "active" : ""}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                height: isAgentTalking ? `${Math.random() * 40 + 10}px` : "8px",
              }}
            ></div>
          ))}
        </div>

        <button
          className={`call-button ${isCalling ? "stop" : "start"}`}
          onClick={toggleConversation}
          disabled={callStatus === "connecting"}
        >
          <svg className="phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCalling ? (
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
            ) : (
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            )}
          </svg>
          {callStatus === "connecting" ? "Connecting..." : isCalling ? "End Call" : "Start Call"}
        </button>

        <div className="footer">
          <p className="description">-</p>
          <p className="contact">-</p>
        </div>
      </div>
    </div>
  )
}

export default App
