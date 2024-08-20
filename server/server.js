const path = require("path");
const assert = require("assert");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const connectToDatabase = require("./configs/connectDB");
const User = require("./models/User");

const PROTO_PATH = path.join(__dirname, "greeting.proto");

connectToDatabase();

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const greeting = protoDescriptor.greeting;

/**
 * @param {!Object} call
 * @param {function():?} callback
 */
function doSayHello(call, callback) {
  callback(null, { message: "Hello " + call.request.name + "!" });
}

/**
 * Create a new greeting
 * @param {!Object} call
 * @param {function():?} callback
 */
async function createGreeting(call, callback) {
  try {
    const newUser = new User({ name: call.request.name });
    const savedUser = await newUser.save();
    callback(null, {
      id: savedUser._id.toString(),
      message: "Hello " + savedUser.name + "!",
    });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Error saving user to database",
    });
  }
}

/**
 * Read all greetings
 * @param {!Object} call
 * @param {function():?} callback
 */
async function readGreetings(call, callback) {
  try {
    const users = await User.find({});
    const response = {
      greetings: users.map((user) => ({
        id: user._id.toString(),
        message: "Hello " + user.name + "!",
      })),
    };

    callback(null, response);
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Error fetching users from database",
    });
  }
}

/**
 * Update a greeting by id
 * @param {!Object} call
 * @param {function():?} callback
 */
async function updateGreeting(call, callback) {
  try {
    const id = call.request.id;
    const newName = call.request.name;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );
    if (!updatedUser) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    } else {
      callback(null, {
        id: updatedUser._id.toString(),
        message: "Hello " + updatedUser.name + "!",
      });
    }
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Error updating user in database",
    });
  }
}

/**
 * Delete a greeting by id
 * @param {!Object} call
 * @param {function():?} callback
 */
async function deleteGreeting(call, callback) {
  try {
    const id = call.request.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    } else {
      callback(null, { id: id, message: "Greeting deleted successfully" });
    }
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Error deleting user from database",
    });
  }
}

/**
 * @return {!Object} gRPC server
 */
function getServer() {
  const server = new grpc.Server();
  server.addService(greeting.Greeter.service, {
    greet: doSayHello,
    createGreeting: createGreeting,
    readGreetings: readGreetings,
    updateGreeting: updateGreeting,
    deleteGreeting: deleteGreeting,
  });
  return server;
}

if (require.main === module) {
  const server = getServer();
  console.log("Server started");
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      assert.ifError(err);
      server.start();
    }
  );
  process.on("SIGTERM", () => {
    server.close(() => {
      console.log("Server terminated");
    });
  });
}
