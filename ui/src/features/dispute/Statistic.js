import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Label, Header, Button, Icon, Dimmer, Loader, Item} from 'semantic-ui-react';
import {allDisputes, fetchAwaitingResults, removeDispute} from './disputeSlice';

export function Statistic() {
  const disputes = useSelector(allDisputes);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAwaitingResults());
  }, []);
  return(
      <Item.Group divided>
        {disputes.map(({id, title, username, chat_id, created_at}) => (
            <Item key={id}>
              <Item.Content>
                <Item.Header as='a'>{title}</Item.Header>
                <Item.Meta>
                  <Label color="blue">{username}</Label>
                  <Label color="grey">{chat_id}</Label>
                  <Label color="grey">{created_at}</Label>
                </Item.Meta>
                <Item.Description>

                </Item.Description>
                <Item.Extra>
                  <Button color='blue' floated='left'>
                    <Icon name='left chevron' />
                    No, incorrect
                  </Button>
                  <Button color='green' floated='left'>
                    Yes, correct
                    <Icon name='right chevron' />
                  </Button>
                  <Button color='red' floated='right' onClick={() => dispatch(removeDispute({id}))}>
                    Delete
                  </Button>
                </Item.Extra>
              </Item.Content>
            </Item>
        ))}
      </Item.Group>
  )
}
