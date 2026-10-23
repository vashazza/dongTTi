---
title: "뇌 MRI 판독문 생성, 평가 점수부터 믿을 수 있을까?"
subtitle: "MR-Weave 프로젝트에서 맡은 LLM-as-a-Judge 검증과 controlled perturbation 실험"
date: 2026-10-23
category: project
project: medgemmamr
readMinutes: 10
---

연구실에서 **3D brain MRI report generation** 프로젝트에 참여했다. 여러 MRI acquisition의 정보를 제한된 visual token 안에 담아 판독문을 생성하는 **MR-Weave** 연구다. 논문 제목은 *Acquisition-Aware Patch Aggregation for 3D Brain MRI Report Generation*.

내가 맡은 부분은 **LLM-as-a-Judge 검증, evaluation, 그리고 perturbation 실험**이었다. 모델 성능을 비교하는 것도 일이었지만, 그 전에 해결해야 할 질문이 있었다. **우리가 쓰는 평가 점수부터 믿을 수 있을까?** 이번 글은 그 질문을 실험으로 확인했던 과정에 대한 기록이다.

### 프로젝트 배경: MRI 정보를 어떻게 줄일 것인가

하나의 뇌 MRI 검사에는 T1w, T2w, FLAIR, SWI 등 여러 contrast와 series가 들어간다. 같은 병변도 acquisition에 따라 잘 드러나는 정보가 다르다. 그런데 모든 volume을 그대로 VLM에 입력하기에는 visual token이 너무 많다.

일부 slice만 고르면 중요한 병변이 포함된 영상을 놓칠 수 있고, feature를 압축하면 세부 공간 정보가 약해질 수 있다. MR-Weave는 공간적으로 정렬된 acquisition들을 이용해 **같은 위치의 patch feature를 학습된 가중치로 합치는 방법**을 제안한다.

공통 axial 방향으로 영상을 정리한 뒤 깊이별 bin을 구성하고, 각 patch 위치에서 contrast·series별 정보를 soft weighting으로 통합한다. 여기에 실제 위치와 크기에 관한 geometry encoding을 더해 판독문을 생성한다. 모델의 backbone은 MedGemma 1.5이며, vision encoder와 projector는 고정하고 fusion module과 language model의 LoRA adapter를 학습한다.

이 모델이 정보를 더 잘 보존하는지는 결국 생성된 판독문으로 확인해야 한다. 여기서 평가 문제가 시작된다.

### 비슷하게 쓴 판독문이 더 정확한 판독문일까?

BLEU, METEOR, ROUGE 같은 지표는 reference와 생성 문장의 어휘적 중복을 측정한다. RadGraph 계열은 추출된 임상 entity와 relation을 비교한다. 서로 다른 정보를 제공하는 유용한 지표지만, **오류의 임상적 중요도까지 점수에 반영하는지**는 따로 확인해야 한다.

예를 들어 다음 두 문장을 보자.

```text
Reference: Mild mucosal thickening is noted ...
Candidate A: Moderate mucosal thickening is noted ...
Candidate B: Severe mucosal thickening is noted ...
```

두 candidate 모두 reference에서 단어 하나를 바꿨다. 하지만 `mild → moderate`와 `mild → severe`는 같은 정도의 변화가 아니다. `right → left`처럼 단어 하나가 바뀌어도 위치 정보가 크게 달라지는 경우가 있다.

그래서 평가에서 확인하고 싶었던 질문은 이것이었다.

**문장 형태가 얼마나 비슷한가와 별개로, 더 중요한 오류가 있는 판독문에 더 낮은 점수를 줄 수 있는가?**

### LLM-as-a-Judge: 점수 하나를 다섯 축으로 나누기

평가에는 Gemini 2.5 Flash를 judge로 사용해 같은 study의 ground-truth report와 generated report를 비교했다. Temperature는 0이며, 각 축은 0–5점 범위에서 0.5점 단위로 평가한다.

| 평가 축 | 확인하는 내용 |
| --- | --- |
| Pathology detection | Reference의 이상 소견을 생성 판독문이 포착했는가? |
| Faithfulness | 근거 없는 소견을 만들거나, 이상 소견이 있는데 정상이라고 명시했는가? |
| Disease labeling | 보고한 소견의 진단명이 맞는가? |
| Localization | 해부학적 위치와 좌우가 맞는가? |
| Severity | 중증도, 크기, 범위가 맞는가? |

**Overall은 다섯 축 점수의 동일 가중 평균**이다. 다만 평균만 보면 어떤 오류가 줄었는지 알기 어렵기 때문에 축별 결과를 함께 봐야 한다.

특히 **누락과 faithfulness를 구분하는 것**이 중요하다. 중요한 병변을 쓰지 않은 것은 detection의 문제이고, 없는 병변을 만들어 쓴 것은 faithfulness의 문제다. 이상 소견을 적극적으로 보고하지 않는 보수적인 출력은 faithfulness가 높더라도 detection이 낮을 수 있다.

또한 이 judge는 영상을 직접 판독하는 평가자가 아니라 **reference report를 기준으로 텍스트를 비교하는 평가자**다. Reference 자체에 빠진 정보가 있다면 그 한계도 함께 갖는다. Temperature 0 역시 sampling 변동을 줄이기 위한 설정이지, 판단의 정확성을 보장하는 장치는 아니다.

### Judge를 검증하기 위해 판독문을 일부러 틀리게 만들기

LLM이 그럴듯한 이유와 점수를 출력한다고 해서 평가자로 믿을 수 있는 것은 아니다. 따라서 오류 종류와 예상 순서를 통제한 **controlled perturbation**으로 평가 민감도를 확인했다.

각 실험은 100개 study에 대해 다음 세 candidate를 구성하는 방식이다.

```text
원본 > 덜 심각한 오류를 넣은 판독문 > 더 심각한 오류를 넣은 판독문
```

MAJOR·MINOR 구분과 오류의 기대 순서는 평가 rubric에 맞췄다. 원본과 변형본을 함께 평가하고, 점수가 의도한 순서대로 내려가는지 비교했다.

| 실험 | 덜 심각한 변형 | 더 심각한 변형 | 겨냥한 평가 내용 |
| --- | --- | --- | --- |
| E1 날조 | MINOR 소견 한 문장 추가 | MAJOR 소견 한 문장 추가 | Faithfulness |
| E2 누락 | MINOR 소견 삭제 | MAJOR 소견 삭제 | Pathology detection |
| E3 위치 | 같은 반구의 다른 엽으로 변경 | 좌우 반전 | Localization |
| E4 진단명 | 구체적인 진단을 `pathology`로 변경 | 무관한 병명으로 변경 | Disease labeling |
| E5 정도 | 정도 표현을 `moderate`로 변경 | `mild ↔ severe` 등 극단 반전 | Severity |
| E6 정상 오단언 | MINOR 이상 부위를 정상이라고 기술 | MAJOR 이상 부위를 정상이라고 기술 | Faithfulness 및 detection |

E6에서는 특히 누락과 정상 오단언을 나눠 보고 싶었다. 병변을 쓰지 않는 것과, 그 부위가 정상이라고 쓰는 것은 다르다. 그래서 E2와 같은 소견 쌍으로 두 경우를 비교할 수 있도록 구성했다.

#### 오류 외의 차이를 줄이는 작업

판독문을 바꿀 때는 오류 종류 외에 문장 길이나 편집량이 결과를 좌우하지 않도록 조건을 맞췄다.

- **E1:** 원래 문장을 건드리지 않고 동일한 날조 문장을 추가했다. 추가하려는 소견이나 관련 표현이 이미 reference에 있는 study는 제외했다.
- **E2:** 하나의 소견에 해당하는 문장을 삭제했다. 한 문장이 여러 소견을 함께 담으면 제외하고, 삭제 문장 수가 비슷한 MAJOR·MINOR 쌍을 선택했다. 100개 중 85개 study에서 삭제 문장 수가 같았다. 삭제한 소견을 가리키는 후속 문장도 함께 제거했다.
- **E3:** 엽과 좌우를 모두 포함한 문장을 골라 각각 한 요소를 바꿨다. 치환 때문에 존재하지 않는 해부학적 구조가 되는 예시는 제외했다.
- **E5:** 이미 `moderate`인 문장은 제외하고, 두 변형의 편집 문장 수를 같게 했다.
- **E6:** E2와 같은 소견 쌍을 사용하되, 삭제 대신 해당 부위에 `No abnormality is observed ...`라는 문장을 넣었다.

이 통제가 완벽한 것은 아니다. 예를 들어 E2의 평균 삭제 문장 수는 MINOR 1.03개, MAJOR 1.19개로 차이가 남았다. 또 E4의 무관 병명 치환에는 뇌 MRI 맥락에서 매우 명백하게 틀린 예시가 포함된다. 이 실험에서 좋은 결과를 얻었다고 해서 미묘한 감별진단 오류까지 잘 평가한다고 말할 수는 없다.

### Perturbation 결과

실험을 수정해 가며 비교했고, 아래는 수정 후의 순위 판별 결과다. 각 오류 유형마다 100개 study를 사용했다.

| 실험 | n | Judge | BLEU-4 | METEOR | ROUGE-L | RG entity | RadGraph F1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E1 날조 | 100 | 99% | 100% | 91% | 100% | 72% | 80% |
| E2 누락 | 100 | 82% | 59% | 62% | 61% | 50% | 55% |
| E3 위치 | 100 | 81% | 17% | 26% | 12% | 11% | 18% |
| E4 진단명 | 100 | 77% | 41% | 53% | 57% | 50% | 54% |
| E5 정도 | 100 | 83% | 0% | 1% | 0% | 23% | 46% |
| E6 정상 오단언 | 100 | 87% | 56% | 55% | 55% | 45% | 49% |

E1에서는 BLEU-4와 ROUGE-L도 높은 값을 보인다. 추가 문장 때문에 reference와의 중복 비율이 낮아지는 경우에는 기존 지표도 순서를 구분할 수 있다는 뜻이다. 반면 **위치와 정도를 바꾸는 E3·E5에서 차이가 컸다.** 특히 E5의 BLEU-4와 ROUGE-L 결과가 0%라는 것은, 단어 교체량이 비슷한 candidate 사이의 임상적 차이를 해당 지표가 충분히 반영하지 못했음을 보여준다.

다만 Judge도 완벽하지 않았다. 수정 후 결과에서 덜 심각한 변형과 더 심각한 변형만 비교한 `2 > 3` 판별은 E4에서 62%였다. 전체 순위 결과와 이 부분 비교는 구별해야 하며, 진단명을 일반화한 경우와 무관한 병명으로 바꾼 경우를 안정적으로 구분하는 데에는 여전히 한계가 있었다.

### 평균 점수보다 선명했던 개별 예시

정도 표현을 바꾼 한 사례에서는 `Mild → Moderate`와 `Mild → Severe`가 **BLEU-4, METEOR, ROUGE-L뿐 아니라 RadGraph 계열에서도 같은 점수**를 받았다. Judge는 severity에 각각 3점과 2점을 부여했다. 단어 하나의 차이보다 그 단어가 나타내는 의미를 구분한 사례다.

위치 오류에서도 비슷한 현상이 있었다. 같은 반구의 엽을 바꾼 candidate와 좌우를 뒤집은 candidate가 어휘 기반 지표에서는 같은 점수를 받았고, RadGraph 계열에서는 오히려 좌우 반전 쪽 점수가 더 높았다.

그렇다고 entity·relation 추출이 의미 없다는 결론은 아니다. **추출된 구조의 유사성과 rubric이 요구하는 오류의 중요도는 서로 다른 평가 대상**이라는 점을 확인한 것이다. 개별 사례만으로 점수 역전의 내부 원인까지 확정할 수도 없다.

축별 점수도 도움이 됐다. 수정 후 결과에서 E3의 localization 평균은 원본 5.00, 다른 엽 2.85, 좌우 반전 1.93이었다. E5의 severity 평균은 4.79, 2.84, 1.74였다. Overall의 순서뿐 아니라, **의도적으로 바꾼 내용에 대응하는 축이 반응하는지** 살펴볼 수 있었다.

### 실제 모델 비교에서는 무엇이 달랐나

실제 생성 판독문 평가에서는 MR-RATE test study 2,000개로 모델들을 비교했다. Controlled perturbation으로 평가자의 반응을 확인했다면, 여기서는 각 모델이 생성한 판독문을 다섯 축으로 살펴봤다.

| 모델 | Detection | Faithfulness | Disease labeling | Localization | Severity | Overall |
| --- | --- | --- | --- | --- | --- | --- |
| MedGemma 1.5, fine-tuned | 1.569 | 2.825 | 1.327 | 1.118 | 0.767 | 1.521 |
| NeuroVFM, zero-shot | 0.853 | 2.949 | 0.652 | 0.473 | 0.392 | 1.064 |
| NeuroVFM, fine-tuned | 0.654 | 2.637 | 0.566 | 0.451 | 0.292 | 0.920 |
| MR-Weave | 1.981 | 2.739 | 1.737 | 1.375 | 1.223 | 1.811 |

MR-Weave는 가장 강한 Overall baseline인 fine-tuned MedGemma 대비 **1.521 → 1.811, 약 19.1% 상대 향상**을 보였다. 다만 faithfulness까지 모든 축에서 최고였던 것은 아니다. NeuroVFM zero-shot은 faithfulness가 더 높지만 detection은 낮았다.

NeuroVFM은 fine-tuning 이후 conventional text-similarity 지표가 개선된 반면, Judge의 임상 평가 축은 모두 낮아졌다. 정상 소견의 반복적인 표현이나 보고서 형식을 잘 따라 쓰는 것과, 병적 소견을 잘 인식하는 것이 다를 수 있다는 해석이었다. 텍스트 평가만으로 모델 내부의 원인을 입증한 것은 아니지만, 왜 여러 평가 축을 함께 봐야 하는지 보여준다.

그리고 MR-Weave의 Overall도 5점 만점에 1.811이다. 비교 모델보다 좋아졌다는 결과와 실제 임상에서 충분히 정확하다는 주장은 구분해야 한다.

### 이 실험에서 남은 것

내가 맡은 평가 작업에서 중요했던 것은 **평가자도 검증 대상이라는 점**이었다. Judge의 설명이 그럴듯한지뿐 아니라, 무엇을 바꾸었을 때 어떤 점수가 어떻게 바뀌어야 하는지 실험으로 만들어야 했다.

이번 perturbation은 오류의 방향과 상대적 심각도를 통제했을 때 Judge가 얼마나 반응하는지 확인하는 데 도움이 됐다. 그러나 이것만으로 전문의 판단과의 일치, 자연스럽게 발생하는 복합 오류에 대한 신뢰성, 다른 기관의 데이터에서의 일반화가 검증된 것은 아니다. 고정된 날조 문장이나 명백한 병명 치환에 대한 성능을 실제 생성 오류 전체로 확대해서도 안 된다.

다음 단계에서는 **전문의 평가와의 일치도**, judge·prompt 변경에 대한 안정성, 자연 발생 오류와 여러 오류가 섞인 사례에서의 동작을 확인할 필요가 있다. 독립적인 radiologist evaluation도 남은 과제다.

모델의 개선을 주장하려면 그 개선을 측정하는 기준부터 설명할 수 있어야 한다. 이번 프로젝트는 판독문 생성 모델을 평가하면서, 동시에 **평가 지표가 무엇을 보상하고 무엇을 놓치는지** 구체적인 실험으로 확인한 경험이었다.

### 참고 자료

- 프로젝트 논문: *Acquisition-Aware Patch Aggregation for 3D Brain MRI Report Generation* (심사 중).
- [GREEN: Generative Radiology Report Evaluation and Error Notation](https://aclanthology.org/2024.findings-emnlp.21/)
- [FineRadScore: A Radiology Report Line-by-Line Evaluation Technique Generating Corrections with Severity Scores](https://proceedings.mlr.press/v252/huang24a.html)
- [RadGraph: Extracting Clinical Entities and Relations from Radiology Reports](https://arxiv.org/abs/2106.14463)
