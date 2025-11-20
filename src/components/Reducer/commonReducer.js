export default function Reducer(state, action) {
    switch (action.type) {
      case 'number':
          return {
            ...state,
            [action.name] : action.number
          }
      case 'text':
          return {
            ...state,
            [action.name]: action.value,
          };
      case 'date':
          return {
              ...state,
              [action.name]: action.date,
          };
      case 'select':
          return {
              ...state,
              [action.id]: action.dataID,
              [action.name]: action.value,

          };
      case 'boolean':
          return {
            ...state,
            [action.name]: action.boolean,
          }
      default:
        return state;
    }
}