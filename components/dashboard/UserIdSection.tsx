"use client";

import { useState } from 'react';

interface UserIdSectionProps {
  userId: string;
}

export default function UserIdSection({ userId }: UserIdSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #e9ecef",
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
          fontSize: "18px",
          fontWeight: "600",
          color: "#152241",
        }}
      >
        🆔 Tu ID de Usuario
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <code
          style={{
            flex: 1,
            fontSize: "13px",
            fontFamily: "Monaco, Consolas, monospace",
            color: "#495057",
            wordBreak: "break-all",
          }}
        >
          {userId}
        </code>
        <button
          onClick={handleCopy}
          style={{
            padding: "8px 12px",
            fontSize: "12px",
            backgroundColor: copied ? "#28a745" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background-color 0.2s",
          }}
        >
          {copied ? "✅ Copiado" : "📋 Copiar"}
        </button>
      </div>

      <p
        style={{
          color: "#6c757d",
          fontSize: "12px",
          marginTop: "8px",
          margin: "8px 0 0 0",
        }}
      >
        Comparte este ID con dueños de negocios para que te agreguen como socio
      </p>
    </div>
  );
}