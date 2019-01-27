import React, { PureComponent } from 'react';
import fetch from 'isomorphic-fetch';
import { parseUrl } from 'query-string';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import {
  Wrapper,
  Columns,
  List,
  PokeItemList,
  PokeItemName,
  PokeItemPic,
  DropAreas,
} from './styled';

const baseApiUrl = 'https://pokeapi.co/api/v2/pokemon/';

const processResults = async (array) => {
  const populatedPokes = array.map(getPokeInfo);
  return await Promise.all(populatedPokes);
}

const getPokeInfo = async (poke) => {
  try {
    const pokeInfoCall = await fetch(poke.url);
    const pokeInfo = await pokeInfoCall.json();
    return { ...poke, pic: pokeInfo.sprites.front_default };
  } catch (err) {
    return poke;
  }
}

export default class extends PureComponent {
  static async getInitialProps({ req }) {
    try {
      const pokeListCall = await fetch(baseApiUrl);
      const pokeList = await pokeListCall.json();
      const params = {};
      if (pokeList.prev) {
        params.prev = parseUrl(pokeList.prev).query;
      } else {
        params.prev = {};
      }
      if (pokeList.next) {
        params.next = parseUrl(pokeList.next).query;
      } else {
        params.next = {};
      }
      const results = await processResults(pokeList.results);
      return { pokelist: results || [], params };
    } catch (err) {
      return { pokelist: [] };
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      params: props.params,
    };
  }

  onDragEnd = () => {
    console.log(`onDragEnd called`);
  }

  render() {
    const { pokelist } = this.props;

    return (
      <Wrapper>
        <DragDropContext
          onDragEnd={this.onDragEnd}
        >
          <Droppable droppableId="poke-drop-1">
            {(provided, snapshot) => (
              <Columns>
                <List>
                  {pokelist.map((p, index) => (
                    <Draggable draggableId={`${p.name}`} index={index} key={p.name}>
                      {(provided, snapshot) => (
                        <PokeItemList
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PokeItemPic src={p.pic} />
                          <PokeItemName>{p.name}</PokeItemName>
                        </PokeItemList>
                      )}
                    </Draggable>
                  ))}
                </List>
                <DropAreas
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                />
              </Columns>
            )}
          </Droppable>
        </DragDropContext>
      </Wrapper>
    );
  }
}