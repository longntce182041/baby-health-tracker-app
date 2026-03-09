import { useEffect, useMemo, useRef, useState } from "react";
import { endDoctorConsultation } from "../../api/doctorConsultationApi";
import {
    getConsultationConversation,
    sendDoctorMessage,
} from "../../api/conversationApi";

const formatClock = (value) => {
    if (!value) return "--:--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

function DoctorChatPage({ consultation, onBack }) {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [ending, setEnding] = useState(false);
    const listRef = useRef(null);

    const consultationId = consultation?.consultationId;

    useEffect(() => {
        if (!consultationId) {
            return;
        }

        let mounted = true;

        const loadConversation = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getConsultationConversation(consultationId);
                if (!mounted) return;
                setConversation(data);
            } catch (apiError) {
                if (!mounted) return;
                setError(apiError.message || "Cannot load conversation");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadConversation();
        const intervalId = setInterval(loadConversation, 4000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [consultationId]);

    useEffect(() => {
        if (!listRef.current) {
            return;
        }
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [conversation?.messages?.length]);

    const parentName = useMemo(() => consultation?.parent || "Parent", [consultation]);
    const patientName = useMemo(() => consultation?.patient || "Patient", [consultation]);

    const handleSend = async () => {
        const content = message.trim();
        if (!content || !consultationId) {
            return;
        }

        try {
            setSending(true);
            await sendDoctorMessage({
                consultationId,
                content,
            });
            setMessage("");

            const latest = await getConsultationConversation(consultationId);
            setConversation(latest);
        } catch (apiError) {
            setError(apiError.message || "Cannot send message");
        } finally {
            setSending(false);
        }
    };

    const handleEndConsultation = async () => {
        if (!consultationId) {
            return;
        }

        try {
            setEnding(true);
            await endDoctorConsultation(consultationId);
            onBack?.();
        } catch (apiError) {
            setError(apiError.message || "Cannot end consultation");
        } finally {
            setEnding(false);
        }
    };

    return (
        <section className="chat-page">
            <header className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-doctor-avatar">DR</div>
                    <div>
                        <h3>Dr. Michael Chen</h3>
                        <p>Pediatrician</p>
                    </div>
                </div>

                <div className="chat-header-center">
                    <p><span className="chat-live-dot" /> Consultation In Progress</p>
                    <small>{patientName} • {formatClock(consultation?.consultationTime)}</small>
                </div>

                <div className="chat-header-actions">
                    <button type="button" className="chat-back-btn" onClick={onBack}>Back</button>
                    <button
                        type="button"
                        className="chat-end-btn"
                        onClick={handleEndConsultation}
                        disabled={ending}
                    >
                        {ending ? "Ending..." : "End Consultation"}
                    </button>
                </div>
            </header>

            <div className="chat-thread" ref={listRef}>
                {loading ? <p className="list-state">Loading conversation...</p> : null}
                {!loading && error ? <p className="list-state list-error">{error}</p> : null}
                {!loading && !error && (!conversation?.messages || conversation.messages.length === 0) ? (
                    <p className="list-state">No messages yet.</p>
                ) : null}

                {!loading && !error && (conversation?.messages || []).map((msg, index) => {
                    const isDoctor = msg.sender === "doctor";
                    return (
                        <div
                            key={`${msg.timestamp || ""}-${index}`}
                            className={`chat-message-row ${isDoctor ? "is-doctor" : "is-parent"}`.trim()}
                        >
                            <div className="chat-message-meta">{isDoctor ? "Dr. Michael Chen" : parentName}</div>
                            <div className={`chat-bubble ${isDoctor ? "doctor" : "parent"}`.trim()}>{msg.content}</div>
                            <div className="chat-message-time">{formatClock(msg.timestamp)}</div>
                        </div>
                    );
                })}
            </div>

            <div className="chat-notes-bar">Doctor's Private Notes</div>

            <footer className="chat-input-wrap">
                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button
                    type="button"
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </footer>
        </section>
    );
}

export default DoctorChatPage;
