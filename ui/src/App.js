import React, {useState} from 'react';
import logo from './logo.svg';
import { Phrase } from './features/phrase/Phrase';
import { Statistic } from './features/dispute/Statistic';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {Menu, Dropdown, Button, TextArea, Segment, Dimmer, Loader, Item} from 'semantic-ui-react';

function App() {
  const [activeItem, setActiveItem] = useState('statistic');
  const handleItemClick = (e, { name }) => setActiveItem(name);
  return (
    <div className="App" style={{padding: '20px'}}>
      {/*<Phrase />*/}

      <Menu size='small'>
        <Menu.Item
            name='phrase'
            active={activeItem === 'phrase'}
            onClick={handleItemClick}
        />
        <Menu.Item
            name='statistic'
            active={activeItem === 'statistic'}
            onClick={handleItemClick}
        />

        <Menu.Menu position='right'>
          {/*<Dropdown item text='Language'>*/}
          {/*  <Dropdown.Menu>*/}
          {/*    <Dropdown.Item>English</Dropdown.Item>*/}
          {/*    <Dropdown.Item>Russian</Dropdown.Item>*/}
          {/*    <Dropdown.Item>Spanish</Dropdown.Item>*/}
          {/*  </Dropdown.Menu>*/}
          {/*</Dropdown>*/}

          {/*<Menu.Item>*/}
          {/*  <Button primary>Sign Up</Button>*/}
          {/*</Menu.Item>*/}
        </Menu.Menu>
      </Menu>

      {activeItem === 'phrase' &&
          <Phrase />
      }

      {activeItem === 'statistic' &&
          <Statistic />
      }

    </div>
  );
}

export default App;
