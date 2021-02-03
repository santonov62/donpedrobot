import React from 'react';
import {Form, Container, TextArea} from 'semantic-ui-react';

export function Phrase() {
  return (
      <Container>
        <Form>
          <Form.TextArea label='Phrase' placeholder='Write here some text...'/>
          <Form.Button>Submit</Form.Button>
        </Form>
      </Container>
  )
}