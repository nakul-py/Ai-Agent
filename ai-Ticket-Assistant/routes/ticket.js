import express from 'express';
import {authenticate} from '../middleware/auth.js';
import { createTicket, getTicket, updateTicket } from '../controller/ticket.js';