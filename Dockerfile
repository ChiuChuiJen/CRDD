# 使用 Python 3.9 映像檔
FROM python:3.9

# 設定工作目錄
WORKDIR /code

# 複製需求文件並安裝
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 複製所有程式碼
COPY . .

# 執行你的主程式 (假設是 main.py)
CMD ["python", "main.py"]
