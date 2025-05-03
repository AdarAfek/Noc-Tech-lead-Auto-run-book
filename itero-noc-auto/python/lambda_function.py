import boto3
import time
import botocore.exceptions
import json
import logging
import pymysql
from datetime import datetime

logger = logging.getLogger()
logger.setLevel("INFO")

def lambda_handler(event, context):
    logger.info(f"Raw event received: {json.dumps(event)}")
    aws_region = event.get("region")
    cluster_id = event.get("id")
    cluster_type = event.get("type")
    logger.info(f"{cluster_id}-{cluster_type}-{aws_region}-invoked for rebooting")
    if not aws_region or not cluster_id or not cluster_type:
        logger.info(f"{cluster_id}-{cluster_type}-{aws_region}-Missing arguments")
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(
                {
                    "error": "Invalid parameters: 'region', 'type', and 'id' are required."
                }
            ),
        }
    try:
        ec2_client = boto3.client("ec2", region_name=aws_region)
        ecs_client = boto3.client("ecs", region_name=aws_region)
        eks_client = boto3.client("eks", region_name=aws_region)
        rebooted = []
        if cluster_type == "ec2":
            ec2_client.reboot_instances(InstanceIds=[cluster_id])
            rebooted.append(cluster_id)
        elif cluster_type == "ecs":
            response = ecs_client.describe_services(
                cluster=cluster_id, services=[cluster_id]
            )
            if not response["services"]:
                raise ValueError(f"No services found in this cluster id {cluster_id}")
            prev_desired_count = response["services"][0]["desiredCount"]
            ecs_client.update_service(
                cluster=cluster_id, service=cluster_id, desiredCount=0
            )
            time.sleep(5)
            ecs_client.update_service(
                cluster=cluster_id, service=cluster_id, desiredCount=prev_desired_count
            )
            rebooted.append(f"ECS Cluster {cluster_id} rebooted")
            
        elif cluster_type == "eks":
            instance_ids = get_worker_node_instance_ids(
                cluster_id, eks_client, ec2_client
            )
            if instance_ids:
                ec2_client.reboot_instances(InstanceIds=instance_ids)
                rebooted.extend(instance_ids)
                
        logger.info(f"{event} reboot Succeeded")
        

    except botocore.exceptions.ClientError as err:
        logger.error(f"{cluster_id}-{cluster_type}-{aws_region}-reboot failed {err} ")
        captains_log("ERROR", f"{cluster_id}-{cluster_type}-{aws_region}-reboot failed {err}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(err)}),
        }


def get_worker_node_instance_ids(cluster_id, eks_client, ec2_client):
    try:
        response = eks_client.describe_cluster(name=cluster_id)
        vpc_id = response["cluster"]["resourcesVpcConfig"]["vpcId"]

        filters = [
            {"Name": "vpc-id", "Values": [vpc_id]},
            {"Name": "tag:eks:cluster-name", "Values": [cluster_id]},
        ]
        instances = ec2_client.describe_instances(Filters=filters)
        instance_ids = [
            instance["InstanceId"]
            for reservation in instances.get("Reservations", [])
            for instance in reservation.get("Instances", [])
        ]
        return instance_ids if instance_ids else None
    except botocore.exceptions.ClientError as err:
        print(f"Error retrieving worker nodes for EKS cluster: {err}")
        return None

def get_rds_connection():
    try:
        return pymysql.connect(
            host='',
            user=''
            password='',
            database='',
            port=
        )
    except Exception as e:
        logger.error(f"Failed to connect to the database: {e}")
        raise
  
def captains_log(level, message):
    try:
       timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
       con=get_rds_connection()
       with con.cursor() as cursor:
           log="""
            INSERT INTO logs (timestamp, level, message)
            VALUES (%s, %s, %s);
           """
           cursor.execute(log,(timestamp,level,message))
           con.commit()
           logger.info(f"Log entry added to the database: {level} - {message}")
           con.close()
    except Exception as e:
        logger.error(f"failed -{e}")
        
           

   
