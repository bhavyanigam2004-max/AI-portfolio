import { useState, useRef, useEffect } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function App() {
  const [question, setQuestion] = useState('')
const [messages, setMessages] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [jobDescription, setJobDescription] = useState('')
const [jobMatchResult, setJobMatchResult] = useState('')
const [jobMatchError, setJobMatchError] = useState('')
const [isMatching, setIsMatching] = useState(false)
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

  const response = await fetch("http://localhost:8000/chat", {
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
    const response = await fetch("http://localhost:8000/match-job", {
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
  return (
    <div className="app">
      <header className="header">
  <h1>Bhavya's AI Portfolio</h1>
  <p>Chat with my AI profile</p>

  <button onClick={() => setMessages([])}>
    Clear Chat
  </button>
</header>

{/* Job Description Matching */}
<div className="job-matching">
  <h2>Job Description Matching</h2>

  <textarea
  placeholder="Paste the job description here..."
  value={jobDescription}
  onChange={(e) => setJobDescription(e.target.value)}
/>

<button onClick={handleJobMatch} disabled={isMatching}>
  {isMatching ? 'Analyzing...' : 'Match Job'}
</button>
<button
  onClick={() => {
    setJobDescription('')
    setJobMatchResult('')
  }}
>
  Clear Match
</button>

</div>

{jobMatchError && (
  <div className="job-match-error">
    {jobMatchError}
  </div>
)}
{jobMatchResult && (
  <div className="job-match-result">

    <h2>Job Match Result</h2>

    <div className="match-score">
  <h3>Match Percentage</h3>
 <div className="score">
  {jobMatchResult.match_percentage}%

  <div className="score-bar">
    <div
      className="score-fill"
      style={{
        width: `${jobMatchResult.match_percentage}%`,
      }}
    ></div>
  </div>
</div>
</div>

    <div className="skill-list">
  {jobMatchResult.matching_skills?.map((skill, index) => (
    <span className="skill-badge" key={index}>
      {skill}
    </span>
  ))}
</div>

    <h3>Relevant Projects / Experience</h3>
   <ul>
  {jobMatchResult.relevant_projects_experience.map((item, index) => (
    <li key={index}>
      {typeof item === 'string' ? (
        item
      ) : (
        <>
          <strong>{item.name}</strong>
          <p>{item.description}</p>
        </>
      )}
    </li>
  ))}
</ul>

    <h3>Missing / Weak Skills</h3>
    <ul>
      {jobMatchResult.missing_or_weak_skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>

    <h3>Overall Assessment</h3>
    <p>{jobMatchResult.assessment}</p>

  </div>
)}

      <main className="chat-container">
     <div className="messages">
  {messages.map((message, index) => (
    <div
      key={index}
      className={`message ${
        message.sender === 'user' ? 'user-message' : 'ai-message'
      }`}
    >
      <strong>
        {message.sender === 'user' ? 'You:' : 'AI:'}
      </strong>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
          <button onClick={handleSend}>Send</button>
        </div>
      </main>
    </div>
  )
}

export default App