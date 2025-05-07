import io
import logging
import os
from pathlib import Path
from typing import Optional, BinaryIO

import zipfile_isal as zipfile
from starlette.responses import FileResponse

from citynexus_api.config import config

logger = logging.getLogger(__name__)
default_project_names = ["citynexus", "immerseon"]

class DataAccessor:

    def __init__(self):
        self.base_path = config.storage["base_path"]

    def get_user_path(self, user_id: Optional[str], sub_path: str) -> str:
        if user_id is None:
            return os.path.join(self.base_path, "default", sub_path)
        else:
            return os.path.join(self.base_path, user_id, sub_path)

    @staticmethod
    def read_file_custom(path: str, create: bool = False) -> BinaryIO:
        # path is already the full path
        if not os.path.exists(path):
            if create:
                # create empty file with "[]"
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write("[]")
            else:
                raise FileNotFoundError(f"Cannot find file {path}")
        return open(path, 'rb')

    def read_file(self, user_id: Optional[str], sub_path: str, create: bool = False) -> BinaryIO:
        full_path = self.get_user_path(user_id, sub_path)
        return self.read_file_custom(path=full_path, create=create)
                  
    def write_file(self, user_id: Optional[str], file_path: str, content: str | bytes) -> None:
        path = self.get_user_path(user_id, file_path)
        self.write_file_custom(path, content)

    def write_file_custom(self, file_path: str, content: str | bytes) -> None:
        mode = 'w' if isinstance(content, str) else 'wb'
        directory = os.path.dirname(file_path)

        # Create the directory if it does not exist
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        try:
            with open(file_path, mode) as file:
                file.write(content)
        except Exception as e:
            logger.error(f"Error writing object {file_path}: {e}")
            raise

    def write_file_compressed(self, user_id: Optional[str], object_key: str, content: str | bytes, file_type: str, is_custom: bool = False):
        # Create a bytes buffer to hold the zip file in memory
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=-12) as zip_file:
            zip_file.writestr(f"data.{file_type}", content)
        buffer.seek(0)

        if is_custom:
            self.write_file_custom(object_key, buffer.read())
        else:
            self.write_file(user_id, object_key, buffer.read())

    def list_files_in_folder(self, user_id: Optional[str], directory_path: str):
        try:
            full_path = self.get_user_path(user_id, directory_path)
            logger.info(f"Search for files in directory: {Path(full_path).absolute()}")
            results = []
            for item in os.listdir(full_path):
                item_path = os.path.join(full_path, item)
                if os.path.isfile(item_path):
                    results.append(item_path)
            logger.info(f"Found {len(results)} files")
            logger.debug(results)
            return results
        except FileNotFoundError:
            logger.error(f"Directory {directory_path} not found.")
            return []
        except Exception as e:
            logger.error(f"Error accessing directory {directory_path}: {e}")
            return []

    def delete_object(self, user_id: Optional[str], file_path: str):
        self.delete_object_custom(self.get_user_path(user_id, file_path))

    @staticmethod
    def delete_object_custom(file_path: str):
        try:
            os.remove(file_path)
        except FileNotFoundError:
            logger.error(f"File {file_path} not found.")
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            raise
          
    def get_file_response(self, user_id: Optional[str], file_path: str, create: bool = False) -> FileResponse:
        with self.read_file(user_id, file_path, create=create) as _:
            file_name = os.path.basename(file_path)

        return FileResponse(
            path=self.get_user_path(user_id, file_path),
            media_type="application/octet-stream",
            filename=file_name,
            headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
        )

    @staticmethod
    def get_file_response_custom(file_path: str):
        file_name = os.path.basename(file_path)

        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=file_name,
            headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
        )
