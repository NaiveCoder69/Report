import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import API from "../api";

export default function Notifications() {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notifications");
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const unreadCount = notes.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    try {
      // now POST to match new backend route
      await API.post(`/notifications/${id}/read`);
      await fetchNotes();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      alert("Failed to mark as read. Check console.");
    }
  };

  const deleteNote = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      await fetchNotes();
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification. Check console.");
    }
  };

  const typeColor = (type) => {
    if (type === "add") return "success";
    if (type === "edit") return "warning";
    if (type === "delete") return "error";
    return "default";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: 3,
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 3, color: "text.secondary" }}
            >
              NOTIFICATIONS
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Activity Center
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              See the latest updates from bills, deliveries, and other actions.
            </Typography>
          </Box>

          <Chip
            label={`Unread: ${unreadCount}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {notes.length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            No notifications yet.
          </Box>
        ) : (
          <List disablePadding>
            {notes.map((n, index) => (
              <React.Fragment key={n._id}>
                <ListItem
                  sx={{
                    alignItems: "flex-start",
                    bgcolor: n.isRead
                      ? "transparent"
                      : "rgba(37, 99, 235, 0.04)",
                    borderRadius: 2,
                    mb: 0.5,
                    px: 2,
                    py: 1.5,
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {!n.isRead && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => markRead(n._id)}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontSize: 13,
                            px: 2.2,
                          }}
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => deleteNote(n._id)}
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontSize: 13,
                          px: 2.2,
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: n.isRead ? 500 : 600,
                            color: n.isRead ? "text.primary" : "#0b3d91",
                          }}
                        >
                          {n.message}
                        </Typography>
                        <Chip
                          size="small"
                          label={n.type?.toUpperCase()}
                          color={typeColor(n.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", mt: 0.25 }}
                      >
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>

                {index < notes.length - 1 && (
                  <Divider component="li" sx={{ my: 0.25 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
