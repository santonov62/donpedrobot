import React, { useState } from 'react';
import {Form, Container, TextArea} from 'semantic-ui-react';
import {addPhrase, fetchPhrases} from './phraseSlice';
import { useSelector, useDispatch } from 'react-redux';

export function Phrase() {
  const phrases = useSelector(fetchPhrases);
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  function onSubmit() {
    dispatch(addPhrase({text}));
    setText('');
  }

  return (
      <Container>
        <Form>
          <Form.TextArea
              label='Phrase'
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='Write here some text...'/>
          <Form.Button onClick={onSubmit}>Submit</Form.Button>
        </Form>
        <div>Phrases: {phrases}</div>
      </Container>
  )
}
