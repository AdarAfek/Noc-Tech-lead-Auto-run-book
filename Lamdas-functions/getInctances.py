import boto3
import json
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor

def lambda_handler(event, context):
    try:
        query_params = event.get("queryStringParameters", {})
        aws_region = query_params.get("region", None)
        resource_type = query_params.get("type", None)
        instance_id= query_params.get("id", None)

        eks_client = boto3.client("eks", region_name=aws_region)
        ecs_client = boto3.client("ecs", region_name=aws_region)
        ec2_client = boto3.client("ec2", region_name=aws_region)

        response_data = {}

        if resource_type:
            resource_type = resource_type.lower()
            print(f"Requested resource type: {resource_type}")

            if resource_type == "eks":
                response_data["EKS_Clusters"] = get_eks_clusters(eks_client)
            elif resource_type == "ecs":
                response_data["ECS_Clusters"] = get_ecs_clusters(ecs_client)
            elif resource_type == "ec2":
                response_data["EC2_Instances"] = get_ec2_instances(ec2_client)
            else:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                    "body": json.dumps({"error": f"Unsupported resource type: {resource_type}"})
                }
        else:
          
            with ThreadPoolExecutor() as executor:
                eks_future = executor.submit(get_eks_clusters, eks_client)
                ecs_future = executor.submit(get_ecs_clusters, ecs_client)
                ec2_future = executor.submit(get_ec2_instances, ec2_client)

                response_data["EKS_Clusters"] = eks_future.result()
                response_data["ECS_Clusters"] = ecs_future.result()
                response_data["EC2_Instances"] = ec2_future.result()

        print(f"Response data: {response_data}")
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  # Allow CORS
            },
            "body": json.dumps(response_data)
        }

    except ClientError as err:
        print(f"Error processing request: {err}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(err)})
        }

def get_eks_clusters(eks_client):
    try:
        response = eks_client.list_clusters()
        return response.get("clusters", [])
    except ClientError as err:
        print(f"Error retrieving EKS clusters: {err}")
        return []

def get_ecs_clusters(ecs_client):
    try:
        response = ecs_client.list_clusters()
        return [arn.split('/')[-1] for arn in response.get("clusterArns", [])]
    except ClientError as err:
        print(f"Error retrieving ECS clusters: {err}")
        return []

def get_ec2_instances(ec2_client):
    try:
        response = ec2_client.describe_instances()
        instances = []
        for reservation in response.get("Reservations", []):
            for instance in reservation.get("Instances", []):
                name = "Unnamed Instance"
                for tag in instance.get("Tags", []):
                    if tag["Key"] == "Name":
                        name = tag["Value"]
                        break

                instances.append({
                    "InstanceId": instance["InstanceId"],
                    "Name": name
                })
        return instances
    except ClientError as err:
        print(f"Error retrieving EC2 instances: {err}")
        return []
