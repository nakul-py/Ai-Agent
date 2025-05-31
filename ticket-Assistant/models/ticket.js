import moongoose from "mongoose";

const ticketSchema = new moongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    default: "TODO",
    enum: ["TODO", "IN_PROGRESS", "DONE"],
  },
  createdBy: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    required: false,
  },
  priority: String,
  deadline: Date,
  helpfulNotes: String,
  relatedSkills: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default moongoose.model("Ticket", ticketSchema);
