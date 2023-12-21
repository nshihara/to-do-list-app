import React, { useEffect, useState, useReducer } from 'react';
import { Helmet } from "react-helmet";
import { Label, Table, Segment, Modal, Header, Form, TextArea, Dropdown, Button, Icon, Divider, Checkbox, Search, Grid, Message } from 'semantic-ui-react';
import _ from 'lodash';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
import Headers from './components/header'; 
const backend_uri = "/api/";

interface searchBoxRep { key: string, title: string, description: string, tags: Array<string>, taskStatus: string };
interface taskRowRep { _id: string, name: string, desc: string, tags: Array<string>, taskStatus: string }



function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}


const TagDropDown = (props: { tagSet: Array<string>, onChange: any, currentTags: Array<string> }) => {
  let initOptions: Array<{ key: string, text: string, value: string }> = [];
  props.tagSet.forEach(tag => {
    initOptions.push({ key: tag, text: tag, value: tag });
  });

  const [options, setOptions] = useState(initOptions);

  const handleAddition = (e: {}, { value }: any) => {
    setOptions([{ key: value, text: value, value: value }, ...options]);
  }
  const handleChange = (e: {}, { value }: any) => { props.onChange(value); }
  return (
    <Dropdown
      options={options}
      value={props.currentTags}
      placeholder='Select Tag'
      search
      selection
      fluid
      multiple
      allowAdditions
      onAddItem={handleAddition}
      onChange={handleChange}
    />
  );
}
const TaskModal = (props: { taskInfo: taskRowRep, tagSet: Array<string>, refreshCallback: any, isCreate: boolean, children: React.ReactNode; }) => {

  const [open, setOpen] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>(props.taskInfo.name);
  const [taskDesc, setTaskDesc] = useState<string>(props.taskInfo.desc);
  const [tags, setTags] = useState<Array<string>>(props.taskInfo.tags);
  const [taskStatus, setTaskStatus] = useState<string>(props.taskInfo.taskStatus);
  const handleTagsChange = (tags: Array<string>) => { setTags(tags); }

  const [isError, setIsError] = useState<boolean>(false);

  let trigger_element = props.children
  const modalHeader = (props.isCreate) ? "Add New Task" : "Edit Task";
  const modalContentHeader = (props.isCreate) ? null : <Header>Editing Task: {props.taskInfo.name}</Header>;

  const modalActions = (props.isCreate) ?
    <>
      <Button onClick={() => {
        setOpen(false);
        setTaskName(props.taskInfo.name);
        setTaskDesc(props.taskInfo.desc);
        setTags(props.taskInfo.tags);
        setTaskStatus(props.taskInfo.taskStatus);
      }}>Cancel</Button>

      <Button color='green' onClick={() => {
        if (taskName === "") {
          setIsError(true);
          return;
        }

        setIsError(false);
        console.log("Adding Task", taskName);
        fetch(backend_uri + "createtask", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: taskName,
            desc: taskDesc,
            tags: tags,
            taskStatus: taskStatus
          })
        })
          .then(res => {
            if (res.ok) {
              console.log("Task Added");
              setOpen(false);
              props.refreshCallback();
              // Reset the form
              setTaskName(props.taskInfo.name);
              setTaskDesc(props.taskInfo.desc);
              setTags(props.taskInfo.tags);
              setTaskStatus(props.taskInfo.taskStatus);
            }
            else {
              console.log("Task Addition Failed");
            }
          });
      }}>
        <Icon name='checkmark' /> Save
      </Button>
    </>
    :
    <>
      <Button.Group floated="left">
        <Button negative onClick={() => {
          console.log("Deleting Task", taskName);
          fetch(backend_uri + "deletetask", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              _id: props.taskInfo._id,
            })
          })
            .then(res => {
              if (res.ok) {
                console.log("Task Deleted");
                setOpen(false);
                props.refreshCallback();
              }
              else {
                console.log("Task Delete Failed");
              }
            });
        }}>Delete Task</Button>
      </Button.Group>

      <Button onClick={() => {
        setOpen(false);
        setTaskName(props.taskInfo.name);
        setTaskDesc(props.taskInfo.desc);
        setTags(props.taskInfo.tags);
        setTaskStatus(props.taskInfo.taskStatus);
      }}>Cancel</Button>

      <Button color='green' onClick={() => {
        if (taskName === "") {
          setIsError(true);
          return;
        }
        setIsError(false);
        console.log("Updating Task", taskStatus);
        fetch(backend_uri + "updatetask", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _id: props.taskInfo._id,
            name: taskName,
            desc: taskDesc,
            tags: tags,
            taskStatus: taskStatus
          })
        })
          .then(res => {
            if (res.ok) {
              console.log("Task Updated");
              setOpen(false);
              props.refreshCallback();
            }
            else {
              console.log("Task Update Failed");
            }
          });
      }}>
        <Icon name='checkmark' /> Save
      </Button>
    </>
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      closeOnDimmerClick={false}
      closeOnEscape={false}
      trigger={trigger_element}
    >
      <Modal.Header>{modalHeader}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {modalContentHeader}
          <Form error={isError}>
            <Form.Field>
              <label>Task Name</label>
              <input placeholder="Task Name" defaultValue={taskName} onChange={(e: any) => setTaskName(e.target.value)} />
            </Form.Field>
            <Form.Field>
              <label>Task Description</label>
              <TextArea placeholder='Task Description' defaultValue={taskDesc} onChange={(e: any) => setTaskDesc(e.target.value)} />
            </Form.Field>
            <Form.Field>
              <label>Tags</label>
              <TagDropDown tagSet={props.tagSet} currentTags={tags} onChange={handleTagsChange} />
            </Form.Field>
            <Form.Field>
              <label>Task Status</label>
              <Dropdown
                placeholder='Select Status'
                fluid
                selection
                defaultValue={taskStatus}
                onChange={(e: {}, { value }: any) => { setTaskStatus(value) }}
              />
            </Form.Field>
            <Message
              error
              header='Error'
              content='Ensure the task name is not empty!'
            />
          </Form>

        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {modalActions}
      </Modal.Actions>
    </Modal>);
}
TaskModal.defaultProps = { isCreate: false, taskInfo: { _id: "", name: "", desc: "", tags: [], taskStatus: "Not Started" } };
function SearchBox(props: { source: Array<searchBoxRep>, searchInDesc: boolean, updateValue: any }) {
  const initialState = {
    loading: false,
    results: [],
    value: '',
  }
  function SearchBoxReducer(state: any, action: any) {
    switch (action.type) {
      case 'CLEAN_QUERY':
        return initialState
      case 'START_SEARCH':
        return { ...state, loading: true, value: action.query }
      case 'FINISH_SEARCH':
        return { ...state, loading: false, results: action.results }
      case 'UPDATE_SELECTION':
        return { ...state, value: action.selection }

      default:
        throw new Error()
    }
  }
  const [state, dispatch] = useReducer(SearchBoxReducer, initialState)
  const { loading, results, value } = state

  // Update results while typing
  const timeoutRef = React.useRef(0)
  const handleSearchChange = React.useCallback((e: any, data: any) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = window.setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({ type: 'CLEAN_QUERY' })
        return
      }

      const re = new RegExp(_.escapeRegExp(data.value), 'i');
      const isMatch = !props.searchInDesc ? (result: any) => re.test(result.title) : (result: any) => re.test(result.title) || re.test(result.description);
      dispatch({
        type: 'FINISH_SEARCH',
        results: _.filter(props.source, isMatch),
      })
    }, 300)
  }, [props.source, props.searchInDesc])
  useEffect(() => {
    dispatch({ type: 'FINISH_SEARCH', results: props.source })
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [props.source])

  useEffect(() => { props.updateValue(value) }, [value, props]);

  return (

    <Search
      fluid
      size='large'
      loading={loading}
      placeholder='Search...'
      onResultSelect={(e, data) => {
        dispatch({ type: 'UPDATE_SELECTION', selection: data.result.title });
      }}
      onSearchChange={handleSearchChange}
      results={results}
      value={value}
    />

  )
}

const TaskTable = () => {
  const [tagSet, setTagSet] = useState<Array<string>>(new Array<string>());

  // Main Table States: Sorting Column, Table Data, Sorting Direction
  function sortReducer(state: any, action: any) {
    switch (action.type) {
      case 'RESET':
        return initTable(action.payload);
      case 'CHANGE_SORT':
        if (state.column === action.column) {
          return {
            ...state,
            data: state.data.slice().reverse(),
            direction:
              state.direction === 'ascending' ? 'descending' : 'ascending',
          }
        }

        return {
          column: action.column,
          data: _.sortBy(state.data, [action.column]),
          direction: 'ascending',
        }
      default:
        throw new Error()
    }
  }
  const initTable = (newdata: Array<taskRowRep>) => {
    return { column: null, data: newdata, direction: null };
  }
  const [backupData, setBackupData] = useState<Array<taskRowRep>>(new Array<taskRowRep>());
  const [state, dispatch] = useReducer(sortReducer, [], initTable); // here state = {column, data, dir}
  const { column, data, direction } = state;

  // Searching States
  const [searchData, setSearchData] = useState<Array<searchBoxRep>>([]);
  const [searchTagOptions, setSearchTagOptions] = useState<Array<{ key: string, text: string, value: string }>>([]);
  const [searchField, setSearchField] = useState<string>("");
  const [searchInDesc, setSearchInDesc] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<Array<string>>([]);
  const [searchStatus, setSearchStatus] = useState<string>("");

  // Responsive Design
  const { height, width } = useWindowDimensions();
  const isSmall = width < 1540;

  // Initial Set-Up, to replace with backend query
  const initialiseData = () => {
    /*
    let initTasks: Array<taskRowRep> = [
      { _id: "1", name: 'Learn HTML', desc: "Create at least something", tags: ['Task 1.1', 'Task 1.2', "Brandon", "Hello", "hello"], taskStatus: "Not Started" },
      { _id: "2", name: 'Learn CSS', desc: "Create at least a stylesheet", tags: ['Task 2.1', 'Task 2.2'], taskStatus: "In Progress" },
      { _id: "3", name: 'Learn JAVASCRIPT', desc: "Create at least an APP", tags: ['Task 3.1', 'Task 3.2'], taskStatus: "Completed" },
      { _id: "4", name: 'Learn C++', desc: "Create at least a programme", tags: ['Task 3.1', 'Task 3.2'], taskStatus: "Completed" },
      { _id: "5", name: 'Learn Python', desc: "Create at least an AI", tags: ['Task 3.1', 'Task 3.2'], taskStatus: "Completed" },
      { _id: "6", name: 'Learn Haskell', desc: "Create at least a paper", tags: ['Task 3.1', 'Task 3.2'], taskStatus: "Completed" },
      { _id: "7", name: 'Learn C#', desc: "Create at least an game", tags: ['Task 3.1', 'Task 3.2'], taskStatus: "Completed" },
    ];*/

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(backend_uri + "getdata", requestOptions)
      .then(response => response.json())
      .then(initTasks => {
        console.log("initTasks: ", initTasks);
        // Initialise States
        dispatch({ type: 'RESET', payload: initTasks });
        setBackupData(initTasks);
        // Convert to SearchBox format {index, title, description, tags, taskStatus}
        var initSearchData: Array<searchBoxRep> =
          initTasks.map((task: taskRowRep) => { return { _id: task._id, title: task.name, description: task.desc, tags: task.tags, taskStatus: task.taskStatus } });
        setSearchData(initSearchData);

        let initTagSet = new Array<string>();
        initTasks.forEach((task: taskRowRep) => {
          task.tags.forEach(tag => {
            initTagSet.push(tag);
          });
        });
        initTagSet = Array.from(new Set(initTagSet)); // Remove duplicates
        initTagSet.sort((a, b) => {                   // Sort alphabetically
          return (a.toLowerCase() > b.toLowerCase()) ? 1 : -1;
        });

        // Convert to Search Tag Dropdown Format {key, text, value}
        var initsearchTagOptions = new Array<{ key: string, text: string, value: string }>();
        initTagSet.forEach(tag => {
          initsearchTagOptions.push({ key: tag, text: tag, value: tag });
        });

        setSearchTagOptions(initsearchTagOptions);
        setTagSet(initTagSet);
      })
      .catch(error => console.log('Error Getting Data from Server: ', error));
  }

  useEffect(initialiseData, []);

  // ===== Handle Searching =====
  // Update Filters

  useEffect(() => {
    let newSearchOptions: Array<searchBoxRep> =
      backupData.map((task: taskRowRep) => { return { key: task._id, title: task.name, description: task.desc, tags: task.tags, taskStatus: task.taskStatus } });

    if (searchTags.length > 0) {
      newSearchOptions = newSearchOptions.filter(task => {
        return searchTags.every(tag => {
          return task.tags.includes(tag);
        });
      });
    }

    if (searchStatus !== "") {
      newSearchOptions = newSearchOptions.filter(task => {
        return task.taskStatus === searchStatus;
      });
    }
    setSearchData(newSearchOptions);
  }, [searchTags, searchStatus, backupData]);

  const handleSubmit = () => {
    let newData = backupData;
    if (searchField !== "") {
      newData = newData.filter(task => {
        if (searchInDesc) {
          return (task.desc.toLowerCase().includes(searchField.toLowerCase()) || task.name.toLowerCase().includes(searchField.toLowerCase()));
        } else {
          return task.name.toLowerCase().includes(searchField.toLowerCase());
        }
      });
    }
    if (searchTags.length > 0) {
      newData = newData.filter(task => {
        return searchTags.every(tag => {
          return task.tags.includes(tag);
        });
      });
    }

    if (searchStatus !== "") {
      newData = newData.filter(task => {
        return task.taskStatus === searchStatus;
      });
    }

    dispatch({ type: 'RESET', payload: newData });
  }

  // Responsive Layout
  const [long_add, setLong_add] = useState(<></>);
  const [short_add, setShort_add] = useState(<></>);
  useEffect(() => {
    if (isSmall) {
      setLong_add(
      <Grid.Row>
            <Grid.Column>
              <Segment style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                <TaskModal tagSet={tagSet} refreshCallback={initialiseData} isCreate={true}>
                  <Button size='huge' fluid  >
                    <Icon name='plus circle' className='addIcon' />
                    Add Task
                  </Button>
                </TaskModal>
              </Segment>
            </Grid.Column>
          </Grid.Row>);
      setShort_add(<></>);
    }
    else{
      setLong_add(<></>);
      setShort_add(<Grid.Column width={2}>
        <Segment style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
          <TaskModal tagSet={tagSet} refreshCallback={initialiseData} isCreate={true}>
            <Button size='huge' fluid  >
              <Icon name='plus circle' className='addIcon' />
              Add
            </Button>
          </TaskModal>
        </Segment>
      </Grid.Column>);
    }
  }, [isSmall, tagSet]);
  return (
    <div>
      {/*{width}, {height}, {isSmall ? "Small" : "Large"}*/}
      <Grid stackable columns='equal'>
        <Grid.Row stretched >

          <Grid.Column>
            <Segment style={{ display: "flex", alignItems: "center" }}>


              <Form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Grid stackable columns='equal' style={{ display: "flex", alignItems: "center" }}>
                  <Grid.Column>
                    <Grid stackable columns='equal' >
                      <Grid.Column style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <SearchBox
                          key={JSON.stringify(searchData) + searchInDesc}
                          source={searchData}
                          searchInDesc={searchInDesc}
                          updateValue={setSearchField} />
                      </Grid.Column>
                    </Grid>
                  </Grid.Column>
                  <Grid.Column tablet={5} computer={2} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  </Grid.Column>
                </Grid>
              </Form>
            </Segment>
          </Grid.Column>
          {short_add}
        </Grid.Row>
        {long_add}



      </Grid>
      <Table celled selectable sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              sorted={column === 'name' ? direction : null}
              onClick={() => {
                dispatch({ type: 'CHANGE_SORT', column: 'name' });
              }}
              key="name"
              width={3}
            >Task Name</Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'desc' ? direction : null}
              onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'desc' })}
              key="desc"
              width={7}
            >Task Description</Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'tags' ? direction : null}
              onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'tags' })}
              key="tags"
              width={4}
            >Tags</Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'taskStatus' ? direction : null}
              onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'taskStatus' })}
              key="taskStatus"
              width={2}
            >Completed</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((rowData: taskRowRep) =>
            <TaskModal key={rowData._id} taskInfo={rowData} tagSet={tagSet} refreshCallback={initialiseData}>
              <Table.Row key={rowData._id}>
                <Table.Cell>{rowData.name}</Table.Cell>
                <Table.Cell>{rowData.desc}</Table.Cell>
                <Table.Cell>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {rowData.tags.map((tag) =>
                      <div style={{ padding: 2 }}>
                        <Label color="blue" tag>{tag}</Label>
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {
                    (rowData.taskStatus === 'Not Started') ?
                      <Label color="red">{rowData.taskStatus}</Label>
                      : (rowData.taskStatus === 'In Progress') ?
                        <Label color="orange">{rowData.taskStatus}</Label>
                        :
                        <Label color="green">{rowData.taskStatus}</Label>
                  }
                </Table.Cell>
              </Table.Row>
            </TaskModal>
          )}
        </Table.Body>
      </Table>
    </div>

  );
}

const MainBodySegment = () => {
  return (
    <div className="mainBodySegment">
      <Segment>
        <div style={{ textAlign: 'center', backgroundColor: '#3B5998', padding: '10px' }}>
           <h1 style={{ color: '#FFFFFF' }}>To-Do App</h1>
        </div>
        <Divider></Divider>
        <TaskTable />
      </Segment >
    </div >
  );
}

function App() {
  useEffect(() => {
    document.title = "TODO App";
  });

  return (
    <div
      className='App' >
      <Helmet>
        <style>{"body { background-color: #dfe5e8; }"}</style>
      </Helmet>
      <Headers /> 
      <MainBodySegment />
    </div >
  );
}

export default App;