# copy-past from : https://wikidocs.net/231156 

from langchain_openai import ChatOpenAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template(
    "You are an expert in astronomy. \
    Answer the question. <Question>: {input}")

params = {
    "temperature": 0.7,         # 생성된 텍스트의 다양성 조정
    "max_tokens": 50,          # 생성할 최대 토큰 수    
}

kwargs = {
    "frequency_penalty": 0.5,   # 이미 등장한 단어의 재등장 확률
    "presence_penalty": 0.5,    # 새로운 단어의 도입을 장려
    "stop": ["\n"]              # 정지 시퀀스 설정
}

llm = ChatOpenAI(model="gpt-4o-mini", **params, model_kwargs= kwargs)
output_parser = StrOutputParser()

chain = prompt | llm | output_parser

# answer = chain.invoke({"input": "지구의 자전주기는?"})
# print(answer)

answer = chain.stream({"input": "지구의 자전주기는?"})
for chunk in answer:
    print(chunk, end="", flush=True)
print()

# 지구의 자전주기는 약 24시간입니다. 정확히 말하면, 지구가 자기 축을 한 번 완전히
# 도는 데 걸리는 시간은 약 23시간 56분 4초로, 이를 '항성일'이라고 합니다. 그러나
# 우리가 경험하는 하루는 태양이 같은 위치에 돌아오는 데 걸리는 시간인 '태양일'로 
# 약 24시간입니다. 이는 지구가 태양 주위를 공전하는 동안 자전해야 하므로 발생하는 차이입니다.