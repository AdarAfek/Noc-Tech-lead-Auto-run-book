import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { SearchInstance } from "./SearchInstance";

const ResourceManager = () => {
  const [region, setRegion] = useState("");
  const [resourceType, setResourceType] = useState("none");
  const [resourceId, setResourceId] = useState("");
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const regionCodes = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "af-south-1",
    "ap-east-1",
    "ap-south-1",
    "ap-south-2",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-southeast-3",
    "ap-southeast-4",
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-northeast-3",
    "ca-central-1",
    "eu-central-1",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "eu-north-1",
    "eu-south-1",
    "eu-south-2",
    "me-south-1",
    "me-central-1",
    "sa-east-1",
  ];

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setInstances([]);
    try {
      const response = await axios.get(
        "",
        {
          params: {
            region,
            type: resourceType === "none" ? undefined : resourceType,
            id: resourceId || undefined,
          },
        }
      );
      const data = JSON.parse(response.data.body);
      console.log("Parsed API Response:", data);

      if (data.ECS_Clusters == true) {
        setInstances(
          data.ECS_Clusters.map((cluster) => ({
            id: cluster,
            name: cluster,
            type: "ecs",
          }))
        );
      } else if (data.EC2_Instances) {
        setInstances(
          data.EC2_Instances.map((instance) => ({
            id: instance.InstanceId,
            name: instance.Name,
            type: "ec2",
          }))
        );
      } else if (data.EKS_Clusters) {
        setInstances(
          data.EKS_Clusters.map((cluster) => ({
            id: cluster,
            name: cluster,
            type: "eks",
          }))
        );
      } else {
        setInstances([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReboot = async (instanceId, instanceType) => {
    if (!instanceId || !instanceType) {
      alert("Instance ID or type is missing.");
      return;
    }
    console.log(instanceId,instanceType)

    try {
      await axios.post(
        "",
        {}, 
        {
          params: {
            id: instanceId,
            type: instanceType,
            region: region,
          },
        }
      );
      
      console.log("Payload being sent:", { id: instanceId, type: instanceType, region });

      alert(`Instance ${instanceId} rebooted successfully.`);
    } catch (err) {
      alert("Error rebooting instance: " + err.message);
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: 700,
        margin: "auto",
        borderRadius: "16px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ marginBottom: 4, textAlign: "center" }}
      >
        Instance Manager
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 3 }}>
        <InputLabel shrink id="Region" style={{ position: "relative" }}>
          Region
        </InputLabel>
        <Select
          labelId="Region"
          label="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <MenuItem value="none">None</MenuItem>
          {regionCodes.map((region, index) => (
            <MenuItem key={index} value={region}>
              {region}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ marginBottom: 3 }}>
        <InputLabel id="resource-type-label" style={{ position: "relative" }}>
          Resource Type
        </InputLabel>
        <Select
          labelId="resource-type-label"
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          displayEmpty
          notched
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="eks">EKS</MenuItem>
          <MenuItem value="ecs">ECS</MenuItem>
          <MenuItem value="ec2">EC2</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="ID (Optional)"
        fullWidth
        sx={{ marginBottom: 3 }}
        value={resourceId}
        onChange={(e) => setResourceId(e.target.value)}
        placeholder="e.g., i-1234567890abcdef0"
        variant="outlined"
      />

      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={handleFetch}
        disabled={loading}
        fullWidth
        sx={{ padding: 1.5, borderRadius: "8px", marginBottom: 4 }}
      >
        {loading ? <CircularProgress size={24} /> : "Fetch Resources"}
      </Button>

      {error && (
        <Typography color="error" sx={{ marginBottom: 3, textAlign: "center" }}>
          {error}
        </Typography>
      )}
      <SearchInstance
        instances={instances}
        handleReboot={handleReboot}
      ></SearchInstance>
    </Box>
  );
};

export default ResourceManager;
