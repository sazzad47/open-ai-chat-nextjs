'use client'

import { useChat } from 'ai/react'


export default function Chat() {

  const { messages, input, isLoading, stop, handleInputChange, handleSubmit } = useChat({
    sendExtraMessageFields: true,
  })

  console.log('messages', messages)

  if (!isLoading) console.log(messages);

  return (
    <>
      <div className="mx-auto w-full max-w-md py-24 flex flex-col">
        <p className="font-bold text-lg">ChatGPT</p>
        <br />
        {messages.map((m) => (
          <div key={m.id} className="w-96 mb-2 p-2">
            {m.role === "user" ? "Human: " : "AI: "}
            {m.content}
          </div>
        ))}

        <br />
        <form onSubmit={handleSubmit}>
          <input
            name="box"
            className="w-96 flex rounded bottom-0 border border-gray-300 text-gray-700 mb-2 p-2"
            value={input}
            onChange={handleInputChange}
          />
          {isLoading ? (
            <button
              type="submit"
              className="opacity-50 cursor-not-allowed w-96 rounded bg-sky-500 hover:bg-sky-700 mb-2 p-2"
              disabled
            >
              Send
            </button>
          ) : (
            <button
              type="submit"
              className="w-96 rounded bg-sky-500 hover:bg-sky-700 mb-2 p-2"
            >
              Send
            </button>
          )}
        </form>
        <p className="w-96 text-slate-500 text-xs">
          You can check the value of a message variable from the console of the
          development tool to see how the value is stored.
        </p>
      </div>
    </>
  )
}