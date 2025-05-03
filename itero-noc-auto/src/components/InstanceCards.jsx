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

export default function InstanceCards({instances,handleReboot}) {
  return (
    <Box sx={{ marginTop: 3 }}>
      {instances.map((instance, index) => (
        <Card
          key={index}
          sx={{
            marginBottom: 2,
            borderRadius: "12px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h6">{instance.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Instance ID: {instance.id}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="secondary"
              variant="outlined"
              onClick={() => handleReboot(instance.id, instance.type)}
              sx={{ marginLeft: "auto", borderRadius: "8px" }}
            >
              Reboot
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
