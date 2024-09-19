import io
import tempfile
import zipfile

import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError
from starlette.responses import FileResponse

from citynexus_api.config import config


class S3Accessor:
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=config.OVH["access_key"],
            aws_secret_access_key=config.OVH["secret_key"],
            endpoint_url=config.OVH["endpoint_url"],
            region_name=config.OVH["region"],
        )
        self.bucket = config.OVH["bucket"]
        self.prefix = config.OVH["prefix"]

    def get_user_path(self, user_id: str | None, object_key: str):
        if user_id is None:
            return f"{self.prefix}/default/{object_key}"
        else:
            return f"{self.prefix}/users/{user_id}/{object_key}"

    def read_file_custom(self, object_key, create=False, raise_error=True):
        try:
            return self.s3.get_object(Bucket=self.bucket, Key=f"{object_key}")
        except ClientError as ex:
            # if there are no user changes saved, load the default scenario's empty user changes
            if ex.response["Error"]["Code"] == "NoSuchKey":
                if create:
                    self.s3.put_object(Bucket=self.bucket, Key=object_key, Body="[]", ACL="public-read")
                    return self.s3.get_object(Bucket=self.bucket, Key=f"{object_key}")
                else:
                    print(f"Cannot find file {object_key}")
                    if raise_error:
                        raise
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(f"Credentials error: {e}")
            if raise_error:
                raise
        except Exception as e:
            print(f"Error reading object {object_key} from bucket {self.bucket}: {e}")
            if raise_error:
                raise

    def read_file(self, user_id: str | None, object_key: str, create=False, raise_error=True) -> dict:
        return self.read_file_custom(self.get_user_path(user_id, object_key), create, raise_error)

    def write_file(self, user_id: str | None, object_key: str, content: str | bytes) -> None:
        try:
            self.s3.put_object(
                Bucket=self.bucket, Key=self.get_user_path(user_id, object_key), Body=content, ACL="public-read"
            )
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(f"Credentials error: {e}")
            raise
        except Exception as e:
            print(f"Error writing object {object_key} to bucket {self.bucket}: {e}")
            raise

    def write_file_compressed(self, user_id: str | None, object_key: str, content: str, type: str):
        # Create a bytes buffer to hold the zip file in memory
        buffer = io.BytesIO()

        # Create a zip file within the buffer
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=5) as zip_file:
            # Write the JSON string to a file within the zip
            zip_file.writestr(f"data.{type}", content)

        buffer.seek(0)
        zipped_content = buffer.read()
        self.write_file(user_id, object_key, zipped_content)

    def list_bucket(self, user_id: str | None, object_key: str):
        all_files = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=self.get_user_path(user_id, object_key))

        if all_files["KeyCount"] > 0:
            return all_files["Contents"]
        else:
            return []

    def delete_object(self, user_id: str | None, object_key: str):
        self.delete_object_custom(self.get_user_path(user_id, object_key))

    def delete_object_custom(self, object_key: str):
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=object_key)
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(f"Credentials error: {e}")
            raise
        except Exception as e:
            print(f"Error writing object {object_key} to bucket {self.bucket}: {e}")
            raise

    def get_streaming_response(self, user_id: str | None, object_key: str, create=False):
        result = self.read_file(user_id, object_key, create)
        # Create a temporary file to write the content to
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(result["Body"].read())
        temp_file.close()

        # Return a FileResponse
        return FileResponse(
            path=temp_file.name,
            media_type="application/octet-stream",
            filename=object_key,
            headers={"Content-Disposition": f'attachment; filename="{object_key}"'},
        )

    def get_streaming_response_custom(self, object_key: str):
        result = self.read_file_custom(object_key)
        # Create a temporary file to write the content to
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(result["Body"].read())
        temp_file.close()

        # Return a FileResponse
        return FileResponse(
            path=temp_file.name,
            media_type="application/octet-stream",
            filename=object_key,
            headers={"Content-Disposition": f'attachment; filename="{object_key}"'},
        )
