import styled from 'styled-components';

export const Wrapper = styled.div`
  font-family: monospace;
`;

export const Columns = styled.div`
  display: flex;
`;

export const List = styled.div`
  width: 300px;
  margin-right: 32px;
  max-height: 300px;
  overflow-y: auto;
`;

export const DropAreas = styled.div`
  width: 300px;
  height: 300px;
  border: 4px dashed #ccc;
`;


export const PokeItemList = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #ddd;
  background: #fff;
`;

export const PokeItemName = styled.strong`
  flex: 1;
  text-transform: capitalize;
`;

export const PokeItemPic = styled.img`
  display: block;
  margin-right: 8px;
  width: 64px;
  height: auto;
`;