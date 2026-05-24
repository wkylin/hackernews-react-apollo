import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gql, useMutation } from '@apollo/client'
import { FEED_QUERY } from './LinkList.jsx'
import { LINKS_PER_PAGE } from '../constants'

const POST_MUTATION = gql`
    mutation PostMutation($description: String!, $url: String!) {
        post(description: $description, url: $url) {
            id
            createdAt
            url
            description
        }
    }
`

function CreateLink() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [postMutation] = useMutation(POST_MUTATION, {
    variables: { description, url },
    onCompleted: () => navigate('/new/1'),
    update: (store, { data: { post } }) => {
      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC'
      const variables = { first, skip, orderBy }
      const data = store.readQuery({
        query: FEED_QUERY,
        variables,
      })

      if (!data) {
        return
      }

      store.writeQuery({
        query: FEED_QUERY,
        data: {
          ...data,
          feed: {
            ...data.feed,
            links: [post, ...data.feed.links],
          },
        },
        variables,
      })
    },
  })

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={e => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <button onClick={() => postMutation()}>Submit</button>
    </div>
  )
}

export default CreateLink
