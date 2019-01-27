import React, { PureComponent } from 'react';
import fetch from 'isomorphic-fetch';
import { parseUrl } from 'query-string';
import {
  Draggable,
  Droppable,
  DragDropContext,
  resetServerContext,
} from 'react-beautiful-dnd';
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
    return { ...poke, pic: pokeInfo.sprites.front_default, pokeId: pokeInfo.id };
  } catch (err) {
    return poke;
  }
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    list: sourceClone,
    selected: destClone,
  };
};

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
    resetServerContext();
    super(props);
    this.state = {
      params: props.params,
      list: props.pokelist,
      selected: [],
    };
  }

  onDragEnd = (dragResult) => {
    const { source, destination } = dragResult;

    if (!destination) {
      return;
    }

    const { list, selected } = this.state;
    const result = move(
      list,
      selected,
      source,
      destination
    );
    const { list: newList, selected: newSelected } = result;
    
    this.setState({
      list: newList,
      selected: newSelected,
    });
    
  }

  render() {
    const { list, selected } = this.state;

    return (
      <Wrapper>
        <DragDropContext
          onDragEnd={this.onDragEnd}
        >
          <Droppable droppableId="poke-drop-1">
            {(provided, snapshot) => (
              <Columns>
                <List>
                  {list.map((p, index) => (
                    <Draggable draggableId={`${p.name}-${p.id}`} index={index} key={p.name}>
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
                >
                  {selected.map(p => (
                    <PokeItemList key={p.pokeId}>
                      <PokeItemPic src={p.pic} />
                      <PokeItemName>{p.name}</PokeItemName>
                    </PokeItemList>
                  ))}
                </DropAreas>
              </Columns>
            )}
          </Droppable>
        </DragDropContext>
      </Wrapper>
    );
  }
}