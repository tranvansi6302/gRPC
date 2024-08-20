import React, { useState, useEffect } from "react";
import { GreeterClient } from "./proto/GreetingServiceClientPb";
import {
  CreateGreetingRequest,
  GreetingReply,
  ReadGreetingsRequest,
  UpdateGreetingRequest,
  DeleteGreetingRequest,
  DeleteGreetingReply,
} from "./proto/greeting_pb";
import {
  Container,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

const client = new GreeterClient("http://localhost:8000");

const createGreeting = async (name: string): Promise<GreetingReply> => {
  const request = new CreateGreetingRequest();
  request.setName(name);

  const response = await client.createGreeting(request, {});
  return response;
};

const readGreetings = async (): Promise<GreetingReply[]> => {
  const request = new ReadGreetingsRequest();
  const response = await client.readGreetings(request, {});
  return response.getGreetingsList();
};

const updateGreeting = async (
  id: string,
  name: string
): Promise<GreetingReply> => {
  const request = new UpdateGreetingRequest();
  request.setId(id);
  request.setName(name);
  const response = await client.updateGreeting(request, {});
  return response;
};

const deleteGreeting = async (id: string): Promise<DeleteGreetingReply> => {
  const request = new DeleteGreetingRequest();
  request.setId(id);
  const response = await client.deleteGreeting(request, {});
  return response;
};

function convertJsonToList(jsonString) {
  try {
    // Chuyển đổi chuỗi JSON thành mảng đối tượng
    let dataList = JSON.parse(jsonString);
    return dataList;
  } catch (e) {
    console.error("Error converting JSON:", e);
    return null;
  }
}

const App: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [greetings, setGreetings] = useState<GreetingReply[]>([]);

  useEffect(() => {
    // Sử dụng hàm này với JSON của bạn
    const jsonString =
      '[{"KeyCatalog":"a","NameVn":"a","Url":"","IsActived":false,"Id":1},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":2},{"KeyCatalog":"a","NameVn":"a","Url":"","IsActived":false,"Id":3},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":4},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":5},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":6},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":7},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":8},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":9},{"KeyCatalog":"bas","NameVn":"a","Url":"","IsActived":false,"Id":10},{"KeyCatalog":"bas","NameVn":"a","Url":"Test","IsActived":false,"Id":11},{"KeyCatalog":"bas","NameVn":"a","Url":"Test","IsActived":false,"Id":12}]';

    const dataList = convertJsonToList(jsonString);
    console.log(dataList);
  }, []);

  useEffect(() => {
    readGreetings().then(setGreetings);
  }, []);

  const handleCreateGreeting = () => {
    if (name) {
      createGreeting(name).then(() => {
        readGreetings().then(setGreetings);
      });
    }
  };

  const handleUpdateGreeting = (id: string) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      updateGreeting(id, newName).then(() => {
        readGreetings().then(setGreetings);
      });
    }
  };

  const handleDeleteGreeting = (id: string) => {
    if (window.confirm("Are you sure you want to delete this greeting?")) {
      deleteGreeting(id).then(() => {
        readGreetings().then(setGreetings);
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h4" gutterBottom>
          Greeting 👋👋👋
        </Typography>
        <Box display="flex" mb={2} width="100%">
          <TextField
            fullWidth
            variant="outlined"
            label="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateGreeting}
            style={{ marginLeft: "10px" }}
          >
            Create
          </Button>
        </Box>
        <List>
          {greetings.map((greeting, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={greeting.getMessage()} />
              <IconButton
                edge="end"
                color="primary"
                onClick={() => handleUpdateGreeting(greeting.getId())}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                color="secondary"
                onClick={() => handleDeleteGreeting(greeting.getId())}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default App;
