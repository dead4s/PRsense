# copy-past from : https://wikidocs.net/231230 

from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI 
from langchain_core.output_parsers import StrOutputParser

example_prompt = PromptTemplate.from_template("질문: {question}\n{answer}")
examples = [
    {
        "question": "지구의 대기 중 가장 많은 비율을 차지하는 기체는 무엇인가요?",
        "answer": "지구 대기의 약 78%를 차지하는 질소입니다."
    },
    {
        "question": "광합성에 필요한 주요 요소들은 무엇인가요?",
        "answer": "광합성에 필요한 주요 요소는 빛, 이산화탄소, 물입니다."
    },
    {
        "question": "피타고라스 정리를 설명해주세요.",
        "answer": "피타고라스 정리는 직각삼각형에서 빗변의 제곱이 다른 두 변의 제곱의 합과 같다는 것입니다."
    },
    {
        "question": "지구의 자전 주기는 얼마인가요?",
        "answer": "지구의 자전 주기는 약 24시간(정확히는 23시간 56분 4초)입니다."
    },
    {
        "question": "DNA의 기본 구조를 간단히 설명해주세요.",
        "answer": "DNA는 두 개의 폴리뉴클레오티드 사슬이 이중 나선 구조를 이루고 있습니다."
    },
    {
        "question": "원주율(π)의 정의는 무엇인가요?",
        "answer": "원주율(π)은 원의 지름에 대한 원의 둘레의 비율입니다."
    }
]

from langchain_core.prompts import FewShotPromptTemplate

prompt = FewShotPromptTemplate(
    examples=examples,              # 사용할 예제들
    example_prompt=example_prompt,  # 예제 포맷팅에 사용할 템플릿
    suffix="질문: {input}",          # 예제 뒤에 추가될 접미사
    input_variables=["input"],      # 입력 변수 지정
)

# 새로운 질문에 대한 프롬프트를 생성하고 출력합니다.
print(prompt.invoke({"input": "화성의 표면이 붉은 이유는 무엇인가요?"}).to_string())

llm = ChatOpenAI(model="gpt-4o-mini")
output_parser = StrOutputParser()

chain = prompt | llm | output_parser

answer = chain.invoke({"input": "화성의 표면이 붉은 이유는 무엇인가요?"})
print(answer)

