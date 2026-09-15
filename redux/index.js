const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';
const OPEN_NOTE = 'OPEN_NOTE';
const CLOSE_NOTE = 'CLOSE_NOTE';

const initialState = {
  nextNoteId: 1,
  notes: {},
  openNoteId: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE: {
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: ''
      };
      return {
        ...state,
        nextNoteId: id + 1,
        openNoteId: id,
        notes: {
          ...state.notes,
          [id]: newNote
        }
      };
    }
    case UPDATE_NOTE: {
      const {id, content} = action;
      const editedNote = {
        ...state.notes[id],
        content
      };
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: editedNote
        }
      };
    }

    case OPEN_NOTE: {
      return {
        ...state,
        openNoteId: action.id,
      }
    }

    case CLOSE_NOTE: {
      return {
        ...state,
        openNoteId: null
      }
    }
    default:
      return state;
  }
};

const state0 = reducer(undefined, {
  type: CREATE_NOTE
});

const state1  = reducer(state0, {
  type: UPDATE_NOTE,
  id: 1,
  content: 'Hello, world!'
});

const validateAction = action => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    throw new Error('Action must be an object!')
  }
  if (typeof action.type === 'undefined') {
    throw new Error('Action must have a type!')
  }
}

const createStore = reducer => {
  let state = undefined;
  const subscribers = [];
  const store = {
    dispatch: (action) => {
      validateAction(action)
      state = reducer(state, action)
      subscribers.forEach(handler => handler())
    },
    getState: () => state,
    subscribe: handler => {
      subscribers.push(handler)
      return () => {
        const index = subscribers.indexOf(handler)
        if (index > 0) {
          subscribers.splice(index, 1)
        }
      }
    }
  }
  store.dispatch({type: '@@redux/INIT'})
  return store;
}

const store = createStore(reducer)

store.dispatch({
  type: CREATE_NOTE
})

store.getState()

const NoteEditor = ({note, onChangeNote, onCloseNote}) => (
  <div>
    <div>
      <textarea 
        className="editor-content"
        autoFocus
        value={note.content}
        onChange={event => onChangeNote(note.id, event.target.value)}
      />
    </div>
    <button className="editor-button" onClick={onCloseNote}>
      Close
    </button>
  </div>
)

const NoteTitle = ({note}) => {
  const title = note.content.splite('\n')[0].replace(/^\s+|\s+$/g, '')
  if (title === '') {
    return <i>Untitled</i>
  }
  return <span>{title}</span>
}

const NoteLink = ({note, onOpenNote}) => (
  <li className="note-list-item">
    <a href="#" onClick={() => onOpenNote(note.id)}>
      <NoteTitle note={note}/>
    </a>
  </li>
);

const NoteList = ({notes, onOpenNote}) => (
  <ul className="note-list">
    {
      Object.keys(notes).map(id =>
        <NoteLink
          key={id}
          note={notes[id]}
          onOpenNote={onOpenNote}
        />
      )
    }
  </ul>
);

const NoteApp = ({
  notes, openNoteId, onAddNote, onChangeNote,
  onOpenNote, onCloseNote
}) => (
  <div>
    {
      openNoteId ?
        <NoteEditor
          note={notes[openNoteId]}
          onChangeNote={onChangeNote}
          onCloseNote={onCloseNote}
        /> :
        <div>
          <NoteList
            notes={notes}
            onOpenNote={onOpenNote}
          />
          {
            <button
              className="editor-button"
              onClick={onAddNote}
            >
              New Note
            </button>
          }
        </div>
    }
  </div>
);

ReactDOM.render(
  <pre><NoteApp /></pre>,
  document.getElementById('root')
);