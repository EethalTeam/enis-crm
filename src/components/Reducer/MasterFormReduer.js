export const initialState = {
    count: 0,
    ExpandDetailValue: '',
    IsDraft: false,
    loading: false,
    AccessRights: { IsAdd:  false, IsEdit:  false, IsView: false, IsDelete: false, IsPrint: false, IsExport: false},
    createEasy: false,
    ConfirmAlert: null,
    editData: [],
    clearFunc : '',
    ShowDetail: false,
    Add: false,
    viewonly: false,
    showDetail: false,
    ExpandTableValue: true,
    id: '',
    PrimaryId:'',
    token: [],
    EditOpen: false,
    EditIsDraft: true,
    showData:[],
    showTableview:true ,
    language:{}
  }
  
  
  
  export function l1Reducer(state, action) {
  switch (action.type) {
  
  case 'count': {
    return {...state, count: action.payload}
  }
  case 'ExpandDetailValue': {
    return {...state, ExpandDetailValue: action.payload}
  }
  case 'EditIsDraft': {
    return {...state, EditIsDraft: action.payload}
  } 
  case 'IsDraft': {
    return {...state, IsDraft: action.payload}
  }
  case 'EditOpen': {
    return {...state, EditOpen: action.payload}
  }
  case 'loading': {
    return {...state, loading: action.payload}
  }
  case 'AccessRights': {
    return {...state, AccessRights: action.payload}
  }
  case 'createEasy': {
    return {...state, createEasy: action.payload}
  }
  case 'ConfirmAlert': {
    return {...state, ConfirmAlert: action.payload}
  }
  case 'editData': {
    return {...state, editData: action.payload}
  }
  case 'ShowDetail': {
    return {...state, ShowDetail: action.payload}
  }
  case 'Add': {
    return {...state, Add: action.payload}
  }
  case 'viewonly': {
    return {...state, viewonly: action.payload}
  }
  case 'showDetail': {
    return {...state, showDetail: action.payload}
  }
  case 'ExpandTableValue': {
    return {...state, ExpandTableValue: action.payload}
  }
  case 'id': {
    return {...state, id: action.payload}
  }
  case 'PrimaryId': {
    return {...state, PrimaryId: action.payload}
  }
  case 'token': {
    return {...state, token: action.payload}
  }
  case 'showData': {
    return {...state, showData: action.payload}
  }
  case 'showTableview': {
    return {...state, showTableview: action.payload}
  }
  case 'language': {
    return {...state, language: action.payload}
  }
  
  default: {
    throw new Error(`Unhandled action type: ${action.type}`)
  }
  }
  }
  