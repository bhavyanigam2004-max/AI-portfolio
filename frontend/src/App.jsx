import { useState, useRef, useEffect } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_URL = "https://ai-portfolio-backend-0icc.onrender.com"

function App() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [jobDescription, setJobDescription] = useState('')
  const [jobMatchResult, setJobMatchResult] = useState('')
  const [jobMatchError, setJobMatchError] = useState('')
  const [isMatching, setIsMatching] = useState(false)

  const [activeView, setActiveView] = useState('chat')

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleSend = async () => {
    if (!question.trim()) return

    setIsLoading(true)

    try {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: question,
        },
      ])

      setQuestion('')

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          history: messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let aiResponse = ''

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '',
        },
      ])

      while (true) {
        const { value, done } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        aiResponse += chunk

        setMessages((prev) => {
          const updatedMessages = [...prev]

          updatedMessages[updatedMessages.length - 1] = {
            sender: 'ai',
            text: aiResponse,
          }

          return updatedMessages
        })
      }

    } catch (error) {
      console.error(error)

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, something went wrong. Please try again!',
        },
      ])

    } finally {
      setIsLoading(false)
    }
  }

  const handleJobMatch = async () => {
    if (!jobDescription.trim()) return

    setIsMatching(true)
    setJobMatchError('')
    setJobMatchResult('')

    try {
      const response = await fetch(`${API_URL}/match-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze job description")
      }

      const data = await response.json()
      const result = JSON.parse(data.result)

      setJobMatchResult(result)

    } catch (error) {
      console.error(error)

      setJobMatchError(
        "Unable to analyze the job description. Please try again."
      )

    } finally {
      setIsMatching(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setQuestion('')
    setActiveView('chat')
  }

  const handleWhyHire = () => {
    setActiveView('chat')
    setQuestion('Why should a recruiter hire Bhavya?')
  }

  const handleAboutMe = () => {
    setActiveView('chat')
    setQuestion('Tell me about Bhavya.')
  }

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-avatar">
            B
          </div>

          <div>
            <h2>Bhavya's AI</h2>
            <p>AI Portfolio</p>
          </div>

        </div>


        <button
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          + New Chat
        </button>


        <div className="sidebar-section">

          <h3>AI TOOLS</h3>

          <button
            className={`sidebar-tool ${
              activeView === 'job' ? 'active-tool' : ''
            }`}
            onClick={() => setActiveView('job')}
          >
            ✦ Job Match
          </button>

          <button
            className="sidebar-tool"
            onClick={handleWhyHire}
          >
            ✦ Why Hire Me?
          </button>

          <button
            className="sidebar-tool"
            onClick={handleAboutMe}
          >
            ✦ About Me
          </button>

        </div>


        <div className="sidebar-section history-section">

          <h3>CONVERSATION HISTORY</h3>

          {messages.length > 0 ? (
            <div className="history-item">
              <span>○</span>
              Current Chat
            </div>
          ) : (
            <p className="no-history">
              No conversations yet
            </p>
          )}

        </div>


        <div className="sidebar-bottom">

          <span className="online-dot"></span>

          AI representative online

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <div className="main-content">


        {/* TOP BAR */}

        <header className="topbar">

          <div>
            <h1>
              Bhavya's AI Representative
            </h1>

            <p>
              Ask questions about the candidate
            </p>
          </div>


          <button
            className="clear-chat-btn"
            onClick={handleNewChat}
          >
            Clear Chat
          </button>

        </header>


        {/* ================= CHAT VIEW ================= */}

        {activeView === 'chat' && (

          <main className="chat-page">

            <div className="messages">

              {messages.length === 0 && (

                <div className="welcome-message">

                  <div className="welcome-avatar">
                    B
                  </div>

                  <h2>
                    Hi! I'm Bhavya's AI representative.
                  </h2>

                  <p>
                    Ask me anything about Bhavya's skills,
                    projects, experience or education.
                  </p>

                </div>

              )}


              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`message ${
                    message.sender === 'user'
                      ? 'user-message'
                      : 'ai-message'
                  }`}
                >

                  <strong>
                    {message.sender === 'user'
                      ? 'You'
                      : "Bhavya's AI"}
                  </strong>


                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.text}
                  </ReactMarkdown>

                </div>

              ))}


              {isLoading && (

                <div className="typing-indicator">
                  AI is typing...
                </div>

              )}


              <div ref={messagesEndRef} />

            </div>


            {/* CHAT INPUT */}

            <div className="input-area">

              <input
                type="text"
                placeholder="Ask something about Bhavya..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend()
                  }
                }}
              />

              <button
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Send'}
              </button>

            </div>

          </main>

        )}


        {/* ================= JOB MATCH VIEW ================= */}

        {activeView === 'job' && (

          <main className="job-page">

            <div className="job-card">

              <div className="job-card-header">

                <h2>
                  Job Description Matching
                </h2>

                <p>
                  Paste a job description to see how well
                  Bhavya matches the role.
                </p>

              </div>


              <textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(e.target.value)
                }
              />


              <div className="job-buttons">

                <button
                  className="match-btn"
                  onClick={handleJobMatch}
                  disabled={isMatching}
                >
                  {isMatching
                    ? 'Analyzing...'
                    : 'Match Job'}
                </button>


                <button
                  className="clear-match-btn"
                  onClick={() => {
                    setJobDescription('')
                    setJobMatchResult('')
                    setJobMatchError('')
                  }}
                >
                  Clear
                </button>

              </div>


              {jobMatchError && (

                <div className="job-match-error">
                  {jobMatchError}
                </div>

              )}


              {jobMatchResult && (

                <div className="job-result">

                  <h2>
                    Job Match Result
                  </h2>


                  <div className="match-score">

                    <span>
                      Match Score
                    </span>

                    <strong>
                      {jobMatchResult.match_percentage}%
                    </strong>

                  </div>


                  <div className="score-bar">

                    <div
                      className="score-fill"
                      style={{
                        width: `${jobMatchResult.match_percentage}%`,
                      }}
                    />

                  </div>


                  <h3>
                    Matching Skills
                  </h3>


                  <div className="skill-list">

                    {jobMatchResult.matching_skills?.map(
                      (skill, index) => (

                        <span
                          className="skill-badge"
                          key={index}
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>


                  <h3>
                    Relevant Projects / Experience
                  </h3>

                  <ul>

                    {jobMatchResult
                      .relevant_projects_experience
                      .map((item, index) => (

                        <li key={index}>

                          {typeof item === 'string'
                            ? item
                            : (
                              <>
                                <strong>
                                  {item.name}
                                </strong>

                                <p>
                                  {item.description}
                                </p>
                              </>
                            )}

                        </li>

                      ))}

                  </ul>


                  <h3>
                    Missing / Weak Skills
                  </h3>

                  <ul>

                    {jobMatchResult
                      .missing_or_weak_skills
                      .map((skill, index) => (

                        <li key={index}>
                          {skill}
                        </li>

                      ))}

                  </ul>


                  <h3>
                    Overall Assessment
                  </h3>

                  <p>
                    {jobMatchResult.assessment}
                  </p>

                </div>

              )}

            </div>

          </main>

        )}

      </div>

    </div>
  )
}

export default App