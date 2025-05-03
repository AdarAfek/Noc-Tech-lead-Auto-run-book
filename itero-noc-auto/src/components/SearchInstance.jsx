import React, { useState } from "react";
import { Box, TextField, List, ListItem, Typography } from "@mui/material";
import InstanceCards from "./InstanceCards";

export function SearchInstance({ instances, handleReboot }) {
  const [searchInput, setSearchInput] = useState("");

  const searchResults = instances.filter((item) => {
    const searchTerm = searchInput.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm)
    );
  });

  const handleChange = (event) => {
    setSearchInput(event.target.value);
  };

  return (
    <Box
      sx={{
        margin: 4,
        padding: 2,
        backgroundColor: "#f3f3f3",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Search Instances
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or ID..."
        value={searchInput}
        onChange={handleChange}
        sx={{ marginBottom: 2 }}
      />
      {searchResults.length > 0 ? (
        <InstanceCards
          instances={searchResults}
          handleReboot={handleReboot}
        ></InstanceCards>
      ) : (
        <Typography color="textSecondary">No results found.</Typography>
      )}
    </Box>
  );
}
