'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import MuiMarkdown from 'mui-markdown'
import Image from 'next/image'
import { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi I'm the PC Build Support Agent, how can i assist you today?`,
    },
  ])

  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
    const response = fetch('api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function proccessText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(proccessText)
      })
    })
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor={"#1a1a1a"}
    >
      <Stack
        direction="column"
        width="750px"
        height="850px"
        border="1px solid black"
        borderRadius={5}
        bgcolor="#2a2a2a"
        p={3}
        spacing={3}
        color="white"
        boxShadow="0 4px 12px rgba(0, 0, 0, 1)"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              //flexDirection={message.role === 'assistant' ? 'row' : 'row-reverse'}
              alignItems={"center"}
              gap={1}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#007BFF' }}>
                  <SmartToyIcon />
                </Avatar>
              )}
              {message.role === 'user' && (
                <Avatar>
                  <AccountCircleIcon/>
                </Avatar> // Replace with user avatar
              )}
              <Box
                bgcolor={
                  message.role === 'assistant' 
                    ? "#333333"
                    : '#007BFF'
                }
                color="white"
                borderRadius={16}
                p={3}
                maxWidth="80%"
              >
                <MuiMarkdown>{message.content}</MuiMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            variant='outlined'
            placeholder ="Ask a question... "
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
            sx={{
              bgcolor: '#444444',
              borderRadius: '20px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
              },
              input: {
                color: 'white',
              },
            }}
          ></TextField>
          <Button variant="contained" onClick={sendMessage} type="submit">
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
