// server/src/modules/rooms/room.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const roomService = require("./room.service");

const getRooms = asyncHandler(async (req, res) => {
  const result = await roomService.getRooms(req.query);
  res.json(apiResponse(true, "Rooms fetched.", result));
});

const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  res.json(apiResponse(true, "Room fetched.", room));
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body);
  res.status(201).json(apiResponse(true, "Room created.", room));
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  res.json(apiResponse(true, "Room updated.", room));
});

const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id);
  res.json(apiResponse(true, "Room deleted."));
});

const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const available = await roomService.checkAvailability(req.params.id, checkIn, checkOut);
  res.json(apiResponse(true, "Availability checked.", { available }));
});

const getAvailableRooms = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, capacity } = req.query;
  if (!checkIn || !checkOut)
    return res.status(400).json(apiResponse(false, "checkIn and checkOut required."));
  const rooms = await roomService.getAvailableRooms(checkIn, checkOut, capacity);
  res.json(apiResponse(true, "Available rooms fetched.", rooms));
});

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, checkAvailability, getAvailableRooms };
