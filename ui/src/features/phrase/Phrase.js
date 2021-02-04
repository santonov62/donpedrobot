import React, { useState, useEffect } from 'react';
import {Form, Container, TextArea, Segment, Dimmer, Loader, Item} from 'semantic-ui-react';
import {addPhrase, selectPhrases, selectLoading, fetchPhrases} from './phraseSlice';
import { useSelector, useDispatch } from 'react-redux';

export function Phrase() {
  const phrases = useSelector(selectPhrases);
  const isLoading = useSelector(selectLoading);
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  useEffect(() => {
    dispatch(fetchPhrases());
  }, []);

  function onSubmit() {
    dispatch(addPhrase({text}));
    setText('');
  }

  return (
      <Container>
        {isLoading &&
          <Loader active size='big'>Loading</Loader>
        }
        <Form>
          <Form.TextArea
              label='Phrase'
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='Write here some text...'/>
          <Form.Button onClick={onSubmit}>Submit</Form.Button>
        </Form>
        {!isLoading && phrases.map(({text}) => (<Segment>{text}</Segment>))
        }
      </Container>
  )
}
