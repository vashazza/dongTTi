---
title: Deliberative Alignment
subtitle: openAi - LLM이 안전 사양을 명시적으로 학습하고, 답변하기 전에 해당 사양에 대해 추론하도록 훈련 하는 새로운 패러다임 Deliberative Alignment 제안
date: 2025-11-13
category: paper
readMinutes: 12
---
### Background

기존의 LLM의 safety 향상은 주로 Supervised Fine-Tuning 또는 Reinforcement Learning from Human Feedback 방식에 의존. 이러한 기존 방법은 다음과 같은 한계가 존재.

1) 즉각적인 응답 요구로 인해 복잡한 윤리적 상황에 대한 '심사숙고' 부족

+) 한정된 양의 계산만 하도록 제한되어 있기 때문

2) 많은 양의 기준을 간접 학습하여 일반화 성능이 떨어짐

→ 여전히 LLM에서는 해로운 컨텐츠를 제공하거나, 안전한 요청을 거부하거나, 탈옥에 취약한 문제점이 부상됨

따라서, 저자는 reasoning 모델에게 deliberate alignment라는 학습 방법을 사용해 답변 전에 학습한 safety policy를 참고하게 함.

### Related Work

**[Safety Training]**

- Supervised Fine-Tuning (SFT): 사전 정의된 안전성 데이터에 기반하여 학습.
- Direct Policy Optimization (DPO): 보상 모델 없이 인간 피드백을 직접적으로 사용하여 정책 조정.
- Constitutional AI (CAI): constitution이라는 미리 정의된 원칙을 모델이 따르도록 함.

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-rbVJu_N237/96471ae760c3e159a043f3b3ce53c5f57d99363b36566ed273f87bbe64981e1fcf49c9d57271d4da511e16e98091e70bb4a134e405b0b0ed065b6e56de476b0cf7bddbdb29dd9c5e9f4f83ce7c40e329bc84e97dfea67ccf38b827acd0248e315c4531f2)

Fig 1. 기존의 파이프라인

→ 기존 방법들에서는 정책을 라벨러에게 제공하며, 모델에 명시적으로 제공되지 않음.

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-5rvzc9MO_9/257a3959b784a087215efec2eac043d5ff081d95a9bbab46b91ac84b0de445b40d40378b35837a44e544c63866f5146cec1c850c934eee6c6702c0d07c4f6457f5f01ff1bf30bd346ffa12217ffeb9abd2f325c1860d72784daf37de1405b33029c8ef4e)

Fig 2. 제안된 deliberative alignment 방식

→ **Deliberative alignment는 모델이 CoT 내에서 직접 정책을 참조하고, 이를 최적화하는 방식으로 훈련됨.**

**[Inference-time Safety Reasoning]**

- Critique and Refine: 비판 및 수정을 통해 초기 응답의 피드백을 제공하고 수정하는 방식을 반복하며 응답의 질 향상.
- Backtracking: [RESET] 토큰 사용해 부적절한 응답 시 처음부터 다시 생성하도록 함.
- Pre-specified Language-Model-Programs (LMPs): 추론할 때 특정 추론 경로를 따라가도록 유도하여 보다 안전한 응답을 생성할 수 있지만 유연성 부족.
    
    → 피드백을 제공하거나 특정 추론 경로를 따라가게 하는 기존의 방식과 달리 deliberative alignment는 모델이 추론 과정에서 자기주도적으로 안전 정책을 고려.
    
    +) backtracking의 경우 CoT 방식을 통해 부분적 수정을 통한 유연한 대처로 보완 가능
    

### Purpose

정당한 논리로 정답(안전 정책에 맞는)을 내도록 하기 위해 **1) CoT를 이용한 훈련 과정에서 정책과 규범을 참고**하도록 하고, **2) test 중에 추가적인 비용을 제공해 안전하고 적절한 대답을 하도록** 함.

---

### Method

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-ljgKTg5-7D/eb00a38ec90bb94f0097c334e614db9ff848b5c2e7c871c880566d3d892e1f5b9215e3e38ef55dbd0222aa82c8d4b446247cebcd9508ac370bc52ded24348f5a29338e6a1c341ecbdeeacc9577a69cae85bbe165176eef4b71ede2903c4d19a7a2c019cb)

Fig 3. Overview

**1) Data Generation**

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-1gcXONWJlU/0a3a48df9c062ab0787c900e54862a6815bbe5490a5c5809a1e2d51b5acfe71fbb6070023a71b7fdd9205b933b5f8aa357e40328e8e78803e54c40afa67722991891a7c676e39dd386a4cdf45582a797f61f49f783cc4f9fe2328b9b65dd66f7fe645b47)

Fig 4. Data generation, Filtering Overview

safety category로 분류된 프롬프트 데이터를 **(prompt, category)** 형태로 base 추론 모델에 입력하여 나온 **(CoT, output)**을 judge model에 입력.

+) safety category: allowed(응답해야 하는 경우), disallowed(거부해야 하는 경우), safe completion(요청을 거부하는 대신 안전한 대체 응답을 제공해야 하는 경우)으로 나뉘어 구분.

++) 안전한 대체 응답의 경우, 자살 위험이나 법적 의료적 조언과 관련된 요청 등의 경우 사용됨.

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-ihWnUI5Y5x/577251e12d862ae6ca9721478c14328449260998c572c0d67c849280e1f7d9dc7f99cdd3a6c378bb37e279733799a2d02ac4b5fd1de2b7ec4ad16ed0b2c17271b422be6e939ca13993215be7bfb662779346590cb8e5ed1ecc04f6c99d8f35af85a06318)

Fig 5. data generation - base model 프롬프트 예시

**[Prompt 구성]**

- 원래 프롬프트
- 해당 안전 카테고리의 규정(spec(category))
- spec(category)의 내용을 인용하여 추론할 것을 지시

**2) Filtering**

judge model(이 또한 reasoning 모델)은 high-quality 답변을 선정해 **(CoT, prompt, output)** 튜플 형태로 반환.

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-3St-9BHsGJ/be1954f71f848cc5fc60489c9544a8986d641123e6ccf32105914faff9f1d706c14592f3ae66400ff96e57dbf7965b0aa65ba0f03f9e8dd6af817054bf3b216382e76352fb0f4c74b6ba660a4747ef973fc7a211381e8285316a9d84b5bc2047ff927f1a)

Fig 6. Filtering - Judgement를 위한 프롬프트 예시

선정 방식: k번 judgement 후 최소값을 취하여 score를 반환하고, 이 score로 high-quality output을 선정.

+) 이 때, judge model은 policy에 대한 직접적인 지식을 가지고 있지 않으며, 미리 학습하지 않고 프롬프트를 통해 전달된 spec(category)에 기반하여 평가.

++) 추가로, 노이즈를 포함하고 있을 수 있기 때문에 다른 Ai가 이 내용을 어떻게 분석했는지 정보를 포함하여 자신의 답변과 비교하도록 하기도 가능.

**3) SFT Training**

안전 정책을 참고해 추론하는 과정과 judge model의 score로 걸러진 output을 담은 **(prompt, CoT, output)** 튜플들 → **base model training**

이 과정을 통해, spec(category)에 대한 context를 제공해주지 않아도 이를 추론할 수 있게끔 함.

**4) RL Training**

보다 복잡한 상황에서 발생하는 문제에서도 뛰어난 일반화 성능을 갖기 위해 CoT를 가린 채 reinforcement learning 진행.(보상체계는 filtering에서 사용했던 judge model 사용)

+) 단, SFT training을 위한 data filtering에서 사용했던 judge model은 CoT를 평가했지만 RL 과정에서는 이를 생략. → 모델의 자율성을 높여 일반화 성능에 이득을 보기 위함.

### Experiments

**[Safety Evaluation]**

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-U01IzT3zqB/d4ee349cb0e3adf9bc6a5b29d9fd0ce2a86ca4981492763e0158e1763d7ee5d3fd9dd0e6f4de23a18f3343e0d3885447821041eb5b21e775bcf1aa96b5f9836746b365118890975e247971728ed8e83646433a5369407f8e1a18af74f7adfa76fa3762ea)

Table 1. Safety Evaluation results

o1-preview, o1, , o3-mini에 deliberate alignment를 적용시키고, GPT-4o와 비교한 결과.

- Disallowed Content

부적절한 요청에 대해 거부하거나 toxic 대화에 반응하는가?

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-JGMrcWpQdo/78bbd219bb9971089a8d7873ebab8310dba43348873c82cd13b10cc33db68ca9136ba1ee4cc859c90dc1d87f263a23ec755807decb9d4d52001196e962a1073b61d6ec1347c864dc4a9eee31536ebda3fd2db6a23362acfcafed55096f4e9fb990e3bc57)

Fig 7. harmful content에 대한 o1 모델의 CoT, 응답 예시(하이라이트=OpenAI의 policy)

- Response style guidelines

답변을 거부하지는 않되 적절한 대안 답을 내놓아야 하는 경우 가이드라인에 맞게 답하는가?

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-hNLcrX0KUc/6d9b7d127151f0196558fd05702330e1e9fa8eec5f0b470aa0d581c95ec637e7bc8dc7ba878534f3c898252c6e367f5ce1c5ae4fba0aa683528fc8f3645a9fcddef187cb3f8de672b18289333c04d845fb9ef780b9bd314519051148b7670c23808f5a53)

Fig 8. self-harm content에 대한 예시

- Jailbreak

암호화된 프롬프트에도 규정을 준수하는 답변을 내놓는가?

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-BiYce8LAuD/3884a98a912b98a15cfd89c76e8e2e7a8132b96c33d816338ff21636cb46ecb54470f186384594ec406988ef860672fb2f163a179d63bd861ac2e4a1523f77f259e5e53d161444d716f3dbfc94258cc20d77d645e020a624fd2a591d115c74c095242521)

Fig 9. Jailbreak 공격에 대한 예시

- Overrefusal

일상적인 질문에 safety trigger가 포함된 경우를 구분할 수 있는가?

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-oo9R8yadOr/6da6157d54dc7230d40290b49b72479d06138430516984fa0f1e5545cd415c8a8ee95547eb39941ff0fab589b66e3d8023705a95bd7ca6939004991f121cbc78df8b313ba6f5df0ef82ff2f319a2dba63e5bdf306e65721e44a17aeddff7b1b282813c5a)

Fig 10. Safety trigger 포함한 질문에 대한 예시

**[외부 모델과의 비교]**

OpenAi 외부의 Gemini 1.5 Pro, Gemini 1.5 Flash, Claude 3.5 Haiku, and Claude 3.5 Sonnet과 비교한 결과

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-iuiZ28cIab/e8a0fcd0888b9f657b2bdcdadd4d65688c0518979e82f5803012f6b410c91b267e0d2833409a56b5d73aa14f77a524a982bbee06ec94c2596f22f21ad01ff376101cbff54fbc31ae70734ec11e51f983e368da075f841d24edbf0c632d0e8fc9e3ff4f80)

Fig 11. external model과의 비교

o1 모델은 WildChat, StrongReject, XSTest, SimpleQA, BBQ 벤치마크에서 타 모델들과 견줄만하거나 더 높은 성능. 다만 Hallucination test에서는 claude 모델에 비해 낮은 성능을 보임.

+) BBQ(bias)를 제외한 모든 벤치마크에서는 1000번의 부트스트랩을 통해 불확실성을 추정하여 error bar로 표시.

++) jailbreak 벤치마크의 경우 다양한 요청을 조합한 compositional jailbreak 시도에서 autograder의 오류가 발생할 수 있기 때문에 사람이 검증.

**[Impact of inference time]**

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-mnxx4LMWza/66df2dfccd7c5481bb2351cee74766771a23131dec5d205c72b3ef7917f1f60e3387e4b947df58b29a9b69397fbb0f9e92f79e38412c0af06363ad2e071bb2164307cf88020c4190d6939ce12e10d957730ea89a3d8c9bcd83b1838f8ad177f8f2d887e6)

Fig 12. inference time에 따른 performance

strongReject의 경우 CoT 추론에 주어진 시간이 길수록 더 나은 성능을 보임.

+) 저자는 이를 복잡한 추론일수록 시간을 많이 주면 더 나은 성능을 보일 수 있다는 증명으로 제시. 그러나 다른 벤치마크에서는 시간에 따른 변화가 잘 보이지 않거나 변동이 큼.

**[Ablation study]**

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-LAIy1lgvDq/9d66112c7a4648ed68df96d3cbaa7c855ea9e5bba112366b7bbe609c7fa46fb470dad7336e6d42e62d2c39986f091eeba88f7e17beb528a47421661818f6bf62dab9351ad37766b3c909bf46e4314d9c7dd283fb4e68dc3882e08d58027371c589fe3d92)

Fig 13. Ablation study

훈련 데이터 속 안전 데이터의 유무로 No safety training, only in SFT, only in RL, in both SFT, RL로 나눠서 실험한 결과 XSTest를 제외한 벤치마크에서 **모두 제안된 deliberative alignment 방식이 가장 성능이 좋음.**

추가적으로, 추론 파트에서 안전 정책을 제공했을 때와 비교하여 안전 정책을 내재화하는 방식이 더 효과적인 것을 증명.

**[Policy retrieval accuracy]**

안전 정책을 얼마나 정확하게 참조하는지 평가.

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-6wW9Z6Tu9C/5067d87c1d4d075f68eb153199882321ead47358ddeda372736bb0f8dc42a5195e49e1c2bd4a870fa9cbbc19d6742f1ebaf16ac5f9ded9fc0dbb40462dc3633f0f39217b723b01a762ad29606a1f6ee25920bce0feddf5f996df9927cf585b5e31571d04)

Table 2. policy retrieval accuracy

각 모델의 CoT에서 정책을 참조하는 문장 추출 
→ 어떤 category(불법 콘텐츠, self-harm 등)에서 유래했는지 식별 
→ 올바르게 category 참조된 비율(정확도) 계산

pre-training 과정에서 간접적으로 학습한 baseline보다 full data의 성능이 훨씬 뛰어남.

**[Generalization to OOD settings]**

일반적인 데이터 외에 non-english, encoded data에 대한 모델 성능 평가

![](https://codahosted.io/docs/AyiLggGD4n/blobs/bl-VyddKtOqoj/23dfc90adfab769ab2b0babe49e964ec80548ae0e255d59c0bd708065d33da59d0b71217f7120ceb6523f67079b7e5630e1b673e0fe3c6a3c671c166e35dacbc9934975f92af0a8135f99a5341f9e3eef0ffb8e649d9854eff2d0d3be19ff772f2bcdb0b)

Table 3. OOD setting에서의 일반화 성능

base64 등으로 인코딩된 프롬프트와 비영어 프롬프트를 통한 jailbreak 시도에도 안전한 응답을 생성하는지 평가한 결과, 영어 데이터만으로 학습한 모델과 full data로 학습한 모델의 성능이 비슷.

→ 사전 훈련에서 **비영어권과 인코딩된 데이터를 사용하지 않았음**에도 deliberative alignment 학습을 통해 일반화되었음을 증명.

---

### Key point

1) 안전 정책 자체를 학습하고 추론하는 방식의 alignment를 처음으로 제안

2) 기존의 방법과 비교해 더 높은 설명 가능성과 일반화 성능 달성

3) 응답, 거절, 대체 응답 카테고리로 나누어 세분화된 제어를 가능케 함.

4) CoT reasoning을 통해 부분적인 수정 가능

5) Data generation 파이프라인 제안 → 여러 도메인 확장 가능성

---

### Limitations and Suggestions

- 이러한 alignment가 Ai의 발전속도를 따라잡을 수 있을 것인지?
- 당연하지만 OpenAI 내부 기준에 최적화되어 있음
- CoT 기반의 Reasoning으로 인한 연산 비용 발생
- data generation의 filtering과 훈련 과정에서 계속 쓰이는 judge model의 초기 설정이 잘못되면 훈련 루프를 거치며 문제가 오히려 심화될 가능성 있음.
    
    +) 특히, OpenAi의 경우 그 정책에 맞게 이미 Pre-trained 된 모델이므로 초기 설정이 수월했을 것. 이를 완전히 새로운/특수한 안전 정책에 transfer 할 수 있는지가 관건.
    

### Personal Insight

- 직접 내재화하는 방법론을 통해 정책을 이해하고 적용하는 능력을 갖춘 모델로 보임.
    - 그러나 추후 겉보기에만 정당한 추론 과정을 거치는 방향으로 발전할 가능성도 있음.
- MLLM의 발전 속도가 빨라지면서 AI 윤리에 대한 대책의 필요성이 대두되는 만큼 자율성과 안전성 그 사이 조율을 위한 방법론을 담은 부분에서 취지가 좋다고 느껴짐!
    - +) 같은 논리에서 더 구체적으로, CoT 과정을 직접적으로 평가하니 다소 딱딱한 추론에 의해 응답의 유연성이 저해되지 않을까 우려됨.
- 저자가 언급한 대로 의료, 법률 관련 고도화된 규범 추론이 필요한 작업에서 좋은 발전을 기대할 수 있을 듯.
- CoT 과정을 직접적으로 평가하니 다소 딱딱한 추론에 의해 응답의 유연성이 저해되지 않을까 우려됨.
- 역시 라벨링도 거의 AI가 진행하는구나

### Overall...

길다... 그리고 뭔가 자기네 모델이라 그런지 추론 모델로 여러가지 실험을 할 수 있는 게 권력처럼 느껴짐
