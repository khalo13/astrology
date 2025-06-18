import React, { useState, useEffect, useRef } from "react";
import "./Numerology.css";
import numberimg1 from "../assets/numberimg1.png";
import numberimg2 from "../assets/numberimg2.png";

const NumerologyCalculator = () => {
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [numerologyResult, setNumerologyResult] = useState(null);
    const [error, setError] = useState("");
    const resultRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem("numerologyResult");
        if (stored) {
            setNumerologyResult(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    useEffect(() => {
        if (resultRef.current && numerologyResult) {
            resultRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [numerologyResult]);

    const handleNumerologySubmit = async (e) => {
        e.preventDefault();
        setError("");
        setNumerologyResult(null);

        if (!fullName || !dateOfBirth) {
            setError("Please enter your full name and date of birth.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/api/numerology", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, date_of_birth: dateOfBirth })
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Something went wrong.");
            } else {
                setNumerologyResult(data);
                localStorage.setItem("numerologyResult", JSON.stringify(data));
            }
        } catch (err) {
            setError("Failed to connect to the numerology server.");
        }
    };

    const SummaryItem = ({ label, value, fullWidth }) => {
        if (value === undefined || value === null || value === "") return null;
        return (
            <div className={`summary-item${fullWidth ? ' full-width' : ''}`}>
                <strong>{label}:</strong> <span style={{ color: "black" }}>{value}</span>
            </div>
        );
    };

    const NumerologySummaryBlock = ({ result }) => {
        if (!result) return null;

        return (
            <div>
                <div className="summary-grid">
                    <SummaryItem label="Life Path Number" value={result.life_path_number} />
                    <SummaryItem label="Destiny Number" value={result.destiny_number} />
                    <SummaryItem label="Root Number" value={result.root_number} />
                    <SummaryItem label="Personality Number" value={result.personality_number} />
                    <SummaryItem label="Expression Number" value={result.expression_number} />
                    <SummaryItem label="Soul Urge Number" value={result.soul_urge_number} />
                    <SummaryItem label="Subconscious Self Number" value={result.subconscious_self_number} />
                    {Array.isArray(result.challenge_numbers) && result.challenge_numbers.length > 0 && (
                        <SummaryItem label="Challenge Numbers" value={result.challenge_numbers.join(", ")} fullWidth />
                    )}
                </div>
            </div>
        );
    };
    const LifePathExplanationBlock = ({ dateOfBirth, lifePathNumber }) => {
        if (!dateOfBirth || !lifePathNumber) return null;

        const reduceToDigit = (num) => {
            const special = [11, 22, 33];
            while (num > 9 && !special.includes(num)) {
                num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
            }
            return num;
        };

        const [dd, mm, yyyy] = new Date(dateOfBirth)
            .toISOString()
            .slice(0, 10)
            .split("-")
            .reverse()
            .map(Number); // convert strings to numbers

        const reducedDD = reduceToDigit(dd);
        const reducedMM = reduceToDigit(mm);
        const reducedYYYY = reduceToDigit(yyyy);
        const ddmmYYYYSum = reducedDD + reducedMM + reducedYYYY;

        return (
            <div className="life-path-section">
                <h3>What is a Life Path Number?</h3>
                <p>Your Life Path Number reveals the most about your personality and the kind of life you might lead. It indicates your life's purpose and the direction you are likely to take.</p>
                <p>It also provides insight into the experiences you may encounter and the lessons you might learn as you journey through life.</p>
                <p>Some people also call the Life Path Number the Ruling Number, Birth Number, Birth Path, or Birth Force Number. In Chaldean numerology, it's known as the Destiny Number.</p>

                <div>
                    <h4>How is it calculated?</h4>
                    <p><strong>Your Birth Date</strong></p>

                    <div className="birth-breakdown">
                        <div className="birth-line-heading">
                            <div>DD</div>
                            <div>MM</div>
                            <div>YYYY</div>
                        </div>
                        <div className="birth-line-values">
                            <div>{dd.toString().padStart(2, '0')}</div>
                            <div>{mm.toString().padStart(2, '0')}</div>
                            <div>{yyyy}</div>
                        </div>

                        {[
                            { label: 'DD', value: dd.toString().split('') },
                            { label: 'MM', value: mm.toString().split('') },
                            { label: 'YYYY', value: yyyy.toString().split('') }
                        ].map((item, idx) => (
                            <div className={`birth-line ${idx === 0 ? 'first' : idx === 1 ? 'middle' : 'last'}`} key={idx}>
                                <div className="birth-label">{item.label}</div>
                                <div className="birth-digits">
                                    {item.value
                                        .map((digit, i) => (
                                            <span className="digit" key={i}>{digit}</span>
                                        ))
                                        .reduce((prev, curr) => [prev, ' + ', curr])}
                                </div>
                            </div>
                        ))}
                    </div>


                    <p><strong>Step 1:</strong> Reduce each part to single digits</p>
                    <div className="birth-total-line">
                        {[reducedDD, reducedMM, reducedYYYY].map((val, idx) => (
                            <React.Fragment key={idx}>
                                <div className={`birth-total ${idx === 0 ? 'first' : idx === 1 ? 'middle' : 'last'}`}>
                                    <strong>{val}</strong>
                                </div>
                                {idx < 2 && <div className="plus-sign"><strong>+</strong></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <p><strong>Step 2:</strong> Add reduced values together</p>
                    <div className="life-path-final-sum"><strong>{ddmmYYYYSum} ⇒ {lifePathNumber}</strong></div>

                    <p><strong>Step 3:</strong> If result is a double digit (not 11/22/33), reduce again</p>
                    <div className="life-path-final-digit"><strong>{lifePathNumber}</strong></div>

                    <h4>Your Life Path Number: <span style={{ color: "black" }}>{lifePathNumber}</span></h4>
                </div>
            </div>
        );
    };


    const LifePathInsightBlock = ({ number }) => {
        const insights = {
            1: {
                intro: `Your path is one of independence, originality, and leadership. Life will constantly push you to assert yourself and take charge of your destiny. You’re here to initiate, lead, and blaze trails where none existed before.`,

                personality: `As a Life Path Number 1, you are ambitious, determined, and self-reliant. You are often seen as a leader and pioneer. You thrive on challenges and need freedom to act on your vision. You may come across as assertive or strong-willed, but it comes from your drive to succeed and be the best.`,

                careers: `You thrive in roles where you’re in control or forging new paths. Careers in entrepreneurship, politics, technology innovation, or leadership positions suit you well. You do best when you're your own boss or allowed autonomy.`,

                strengths: [
                    "Leadership – a natural ability to inspire and guide others",
                    "Initiative – quick to act and pursue new goals",
                    "Confidence – believe in your abilities without hesitation",
                    "Independence – highly self-motivated and driven",
                    "Innovation – creative thinker with bold ideas"
                ],

                challenges: [
                    "Stubbornness – can resist others’ input",
                    "Impatience – easily frustrated by delays",
                    "Arrogance – may appear overly confident or self-centered",
                    "Loneliness – being too independent can isolate you",
                    "Overworking – pushing yourself too hard without pause"
                ]
            },

            2: {
                intro: `You are here to create harmony, nurture relationships, and serve others with compassion. Your path is about cooperation, intuition, and emotional sensitivity.`,

                personality: `Life Path 2s are deeply empathetic and value peace and unity. You often act as the peacemaker, mediator, or gentle force that keeps things balanced. You may struggle in loud or aggressive environments, preferring calm and stability.`,

                careers: `You excel in fields involving teamwork, diplomacy, healing, and support. Ideal professions include counseling, mediation, education, nursing, or spiritual coaching.`,

                strengths: [
                    "Empathy – deeply in tune with others’ emotions",
                    "Diplomacy – skilled at managing conflicts",
                    "Loyalty – dedicated and dependable",
                    "Sensitivity – strong emotional awareness",
                    "Cooperation – excellent team player"
                ],

                challenges: [
                    "Over-sensitivity – can take things personally",
                    "Indecisiveness – struggles with making firm choices",
                    "Dependency – may rely too much on others",
                    "Avoidance – tends to withdraw from conflict",
                    "Low confidence – may undervalue your own worth"
                ]
            },

            3: {
                intro: `Your path is one of joyful expression, creativity, and communication. You're meant to inspire, uplift, and bring happiness to others through your talents and charm.`,

                personality: `Life Path 3s are naturally expressive and often have a great sense of humor. You're artistic, charismatic, and find it easy to connect with others. You love beauty, fun, and live for meaningful conversations.`,

                careers: `Creative roles in writing, performing arts, entertainment, design, and communication are ideal. You also shine in teaching or social media where you can speak freely.`,

                strengths: [
                    "Creativity – naturally gifted in artistic expression",
                    "Communication – eloquent and engaging",
                    "Optimism – radiate joy and positivity",
                    "Sociability – friendly and approachable",
                    "Charisma – attract people with charm"
                ],

                challenges: [
                    "Scattered energy – easily distracted",
                    "Superficiality – may avoid deep issues",
                    "Overindulgence – prone to emotional highs/lows",
                    "Self-doubt – struggles with inner confidence",
                    "Restlessness – can feel ungrounded"
                ]
            },

            4: {
                intro: `Your path is about building strong foundations, discipline, and service. You're here to create order and bring practical solutions into the world.`,

                personality: `Life Path 4s are methodical, structured, and hardworking. You value stability, honesty, and results. While you may seem serious, it’s because you’re focused on long-term security and trust.`,

                careers: `Ideal roles include engineering, architecture, law enforcement, construction, finance, or agriculture. You thrive in careers with clear structure and responsibility.`,

                strengths: [
                    "Discipline – excellent at following through",
                    "Reliability – people count on you",
                    "Organization – skilled with structure",
                    "Hardworking – tireless and goal-focused",
                    "Integrity – high moral standards"
                ],

                challenges: [
                    "Rigidity – resistant to change",
                    "Workaholic tendencies – overburden yourself",
                    "Perfectionism – can be overly critical",
                    "Overcautious – reluctant to take risks",
                    "Stubborn – may cling to old systems"
                ]
            },

            5: {
                intro: `You are a freedom-loving explorer. Your path is filled with change, movement, and experience. You're here to embrace life in all its variety.`,

                personality: `Life Path 5s are adaptable, curious, and love variety. You live for adventure and are constantly looking for the next experience or breakthrough. Freedom is essential for your happiness.`,

                careers: `You thrive in travel, media, marketing, journalism, technology, or any fast-paced, flexible work. Entrepreneurship also suits your drive for independence.`,

                strengths: [
                    "Adaptability – easily handle change",
                    "Curiosity – constantly learning",
                    "Versatility – multi-talented",
                    "Freedom-loving – independent and spontaneous",
                    "Energetic – full of life"
                ],

                challenges: [
                    "Restlessness – hard to settle",
                    "Commitment issues – avoids long-term ties",
                    "Impulsiveness – acts without planning",
                    "Inconsistency – struggles with follow-through",
                    "Overindulgence – can go to extremes"
                ]
            },

            6: {
                intro: `You are a nurturer and protector. Your path is about responsibility, love, and community service. Family, beauty, and harmony are central themes.`,

                personality: `Life Path 6s are compassionate, idealistic, and dependable. You have a strong sense of justice and often become the go-to person for support.`,

                careers: `You thrive in roles like caregiving, therapy, education, interior design, social work, or artistic professions involving harmony.`,

                strengths: [
                    "Compassionate – deeply caring and kind",
                    "Responsible – dependable and loyal",
                    "Service-oriented – always willing to help",
                    "Protective – look after others' well-being",
                    "Fair – a strong moral compass"
                ],

                challenges: [
                    "Over-caretaking – sacrificing your needs",
                    "Judgmental – can be overly moralistic",
                    "Controlling – may smother others",
                    "Martyr complex – puts others above self",
                    "Worrying – prone to anxiety"
                ]
            },

            7: {
                intro: `Your path will lead you to study, test, and analyze everything in life. You’re naturally drawn to the unseen, the mysterious, and the spiritual. The number 7 represents introspection, inner wisdom, and truth-seeking. Your journey is not about material achievements, but about discovering the deeper purpose of life and uncovering hidden meanings in all you do.`,

                personality: `You're a born seeker of truth with a deep desire to understand the world and your place in it. You often appear reserved or solitary, but it's because you value time alone to think, learn, and reflect. You tend to be introspective, thoughtful, and philosophical. While you may not be the most socially outgoing, people admire your depth, intellect, and insight.`,

                careers: `With your 7 Life Path Number, you're well-suited for careers that allow for research, analysis, or solitude. Fields such as science, philosophy, metaphysics, academia, psychology, and technology align with your interests. You may also thrive in spiritual vocations or creative areas like writing, where introspection is key. Working independently or in low-stimulation environments helps you excel.`,

                strengths: [
                    "Intellectual – you love learning and mastering complex topics",
                    "Technically oriented – skilled with logic, technology, and precision",
                    "Investigative – naturally curious and analytical",
                    "Intuitive – strong gut instincts and inner knowing",
                    "Analytical – can break down complex problems with ease"
                ],

                challenges: [
                    "Intolerant – can be rigid in views or dismissive of others’ opinions",
                    "Secretive – tend to keep emotions and thoughts guarded",
                    "Pessimistic – may struggle to see the bright side during hard times",
                    "Cynical – prone to doubting others' intentions",
                    "Suspicious – may find it hard to trust without solid proof"
                ]
            },
            8: {
                intro: `Your path is centered on mastery over the material world, power, and personal authority. Life Path Number 8 symbolizes ambition, structure, and financial success. You are meant to achieve abundance through discipline, responsibility, and leadership. This number carries the energy of karma, meaning you must learn to balance personal desires with fairness and integrity.`,

                personality: `You’re practical, determined, and strong-willed. Others see you as confident, commanding, and business-savvy. You naturally take on leadership roles and have a talent for organizing and managing resources. While you may appear serious or driven, underneath lies a desire to create stability and legacy. You value achievement, but must also learn to manage emotional expression and maintain work-life balance.`,

                careers: `With your 8 Life Path Number, you're suited for careers that involve leadership, finance, law, management, or entrepreneurship. You excel where strategy, discipline, and high-stakes decision-making are required. Fields like corporate leadership, banking, real estate, politics, or owning a business can offer you both challenge and reward. Long-term success comes from ethical power and balanced authority.`,

                strengths: [
                    "Ambitious – driven to achieve high goals and long-term success",
                    "Efficient – skilled at organizing, planning, and executing",
                    "Strategic – always thinking steps ahead with clear vision",
                    "Authoritative – natural leader who commands respect",
                    "Resilient – can bounce back from setbacks stronger than before"
                ],

                challenges: [
                    "Materialistic – can become overly focused on money or status",
                    "Overbearing – may unintentionally dominate or control others",
                    "Impatient – desire for quick results may lead to frustration",
                    "Controlling – struggles to delegate or release power",
                    "Emotionally distant – may suppress feelings in favor of logic or control"
                ]
            },
            9: {
                intro: `Your path is one of compassion, selflessness, and spiritual awareness. Life Path Number 9 represents completion, service, and emotional depth. You are here to make the world a better place by using your empathy, creativity, and wisdom to uplift others. This is a number of transformation, urging you to let go of ego and embrace universal love.`,

                personality: `You're idealistic, generous, and deeply emotional. You often feel a calling to help those in need, whether through personal support or broader humanitarian efforts. People are drawn to your charisma and heartfelt sincerity. However, you can sometimes struggle with letting go of pain or feeling overly responsible for others. Your emotional intelligence and artistic sensitivity set you apart.`,

                careers: `With your 9 Life Path Number, you thrive in careers related to healing, charity, education, the arts, and social work. You are drawn to causes and communities, and may work in non-profits, healthcare, counseling, creative industries, or global activism. Fulfillment comes when your work aligns with your higher ideals and serves a greater good.`,

                strengths: [
                    "Compassionate – deeply care for others’ pain and wellbeing",
                    "Creative – expressive in arts, ideas, and emotional storytelling",
                    "Generous – freely give time, support, and love to others",
                    "Emotionally deep – intuitive and connected to the inner world",
                    "Selfless – often put others’ needs above your own"
                ],

                challenges: [
                    "Overly idealistic – can be disappointed when others fall short",
                    "Withdrawn – may isolate when overwhelmed emotionally",
                    "Martyr complex – risk overgiving or sacrificing too much",
                    "Letting go – struggle to release past hurts or attachments",
                    "Emotionally reactive – intense feelings may lead to impulsive actions"
                ]
            }

        };

        const info = insights[number];
        if (!info) return null;

        return (
            <div className="life-path-insight-section">
                <h3>Your Life Path Number <span style={{ color: "black" }}>{number}</span></h3>
                <p>{info.intro}</p>
                <p>{info.personality}</p>
                <p>{info.careers}</p>

                <div className="flex-row">
                    <div className="strengths">
                        <h4>Top 5 Strengths</h4>
                        <ul>
                            {info.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="challenges">
                        <h4>Top 5 Challenges</h4>
                        <ul>
                            {info.challenges.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

        );
    };

    const DestinyNumberExplanationBlock = ({ fullName, destinyNumber }) => {
        if (!fullName || !destinyNumber) return null;

        const chaldeanMap = {
            1: "A", 2: "BCK", 3: "GJL", 4: "DM", 5: "ENH",
            6: "UVWX", 7: "OZ", 8: "FP", 9: "IRQSTY"
        };

        const getChaldeanValue = (letter) => {
            letter = letter.toUpperCase();
            for (const [num, letters] of Object.entries(chaldeanMap)) {
                if (letters.includes(letter)) return parseInt(num);
            }
            return 0;
        };

        const reduceToDigit = (num) => {
            const special = [11, 22];
            while (num > 9 && !special.includes(num)) {
                num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
            }
            return num;
        };

        const nameParts = fullName.toUpperCase().split(" "); // ['LOVE', 'KHANNA']

        const nameLetters = nameParts.map(part => part.split(""));
        const nameNumbers = nameLetters.map(letters => letters.map(getChaldeanValue));
        const nameTotals = nameNumbers.map(nums => nums.reduce((a, b) => a + b, 0));
        const nameSum = nameTotals.reduce((a, b) => a + b, 0);
        const reducedNameNumber = reduceToDigit(nameSum);

        const meanings = {
            4: "You exude the aura of a 'Dedicated Worker' with strong values around responsibility, structure, and long-term goals."
        };

        return (
            <div className="destiny-number-section">
                <h3>Your Name / Destiny Number</h3>
                <p>
                    Your <strong>Name/ Destiny Number</strong>, also called your <strong>Minor Expression Number</strong>,
                    comes from the first and last name you use every day. It might be a shorter version of your birth name
                    or a new name if you got married, or changed it for another reason.
                </p>
                <p>
                    This number shows the energy you put out into the world when you use that name. It's like your
                    "energetic signature" that adds to your personality, strengths, lessons, experiences, and opportunities
                    based on your other numbers.
                </p>


                <p ><strong>Your Full Name</strong></p>
                <div className="name-breakdown">
                    {nameLetters.map((letters, idx) => (
                        <div className={`name-line ${idx === 0 ? 'first-name' : 'last-name'}`} key={`name-line-${idx}`}>
                            {letters.map((letter, i) => (
                                <span className="letter" key={i}>
                                    {letter}
                                </span>
                            )).reduce((prev, curr) => [prev, " + ", curr])}
                        </div>
                    ))}
                </div>

                <p><strong>Step 1:</strong> Give each letter a number based on its place in the Chaldean numerology chart</p>
                <div className="name-breakdown">
                    {nameNumbers.map((nums, idx) => (
                        <div className={`name-line ${idx === 0 ? 'first-name' : 'last-name'}`} key={`nums-line-${idx}`}>
                            {nums.map((num, i) => (
                                <span className="digit" key={i}>
                                    {num}
                                </span>
                            )).reduce((prev, curr) => [prev, " + ", curr])}
                        </div>
                    ))}

                </div>
                <p><strong>Step 2:</strong> Find total for each name part separately</p>

                <div className="name-total-line">
                    {nameTotals.map((total, idx) => (
                        <React.Fragment key={`total-${idx}`}>
                            <div className={`name-total ${idx === 0 ? 'first-name' : 'last-name'}`}>
                                <strong>{total}</strong>
                            </div>
                            {idx < nameTotals.length - 1 && (
                                <div className="plus-sign"><strong>+</strong></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>


                <p><strong>Step 3:</strong> Add all those part totals together</p>
                <div className="name-final-sum"><strong>{nameSum} ⇒ {reducedNameNumber}</strong></div>

                <p><strong>Step 4:</strong> If multiple digits, keep adding until a single digit</p>
                <div className="name-final-digit"><strong>{reducedNameNumber}</strong></div>

                <h4>Your Name Number: <span style={{ color: "black" }}>{destinyNumber}</span></h4>
                <p>{meanings[destinyNumber]}</p>

            </div>
        );
    };

    const PersonalityNumberExplanationBlock = ({ personalityNumber }) => {
        if (!personalityNumber) return null;

        const meanings = {
            1: {
                title: "Your Personality Number",
                intro: "Your Personality Number reveals the outer layer of your character—the part of you others first notice.",
                details: "A Personality Number of 1 presents you as confident, assertive, and independent. People see you as a leader, someone who takes charge and isn’t afraid to speak up or go first.",
                perception: "Because of this number, you’re often perceived as strong-willed, self-reliant, and capable of initiating action.",
                strengths: [
                    "Self-assured – naturally confident and grounded in your identity",
                    "Independent – thrive on autonomy and prefer leading over following",
                    "Decisive – quick to act and not afraid of responsibility",
                    "Innovative – bring original ideas and a pioneering spirit",
                    "Motivating – inspire others with your drive and ambition"
                ],
                challenges: [
                    "Domineering – may unintentionally come off as bossy or overbearing",
                    "Impatient – can get frustrated with delays or slower individuals",
                    "Overly self-reliant – reluctant to ask for help even when needed",
                    "Insensitive – may overlook others’ feelings while focused on goals",
                    "Competitive – can push too hard to be first or best"
                ]
            },

            2: {
                title: "Your Personality Number",
                intro: "Your Personality Number highlights how others perceive your approach to relationships and harmony.",
                details: "A Personality Number of 2 makes you appear gentle, diplomatic, and cooperative. You’re often seen as the peacemaker or the emotional anchor in groups.",
                perception: "You’re seen as caring, calm, and someone who values connection over competition.",
                strengths: [
                    "Diplomatic – skilled at finding common ground and resolving conflicts",
                    "Supportive – always there for others with a listening ear",
                    "Empathetic – deeply understand others’ emotions and moods",
                    "Cooperative – prefer teamwork and collaboration",
                    "Tactful – know how to say the right thing at the right time"
                ],
                challenges: [
                    "Overly sensitive – can take things too personally",
                    "Indecisive – struggle to choose when options are conflicting",
                    "Conflict-avoidant – may suppress your own needs to keep peace",
                    "Dependent – can overly rely on others for validation",
                    "Shy – may hold back or fade into the background"
                ]
            },

            3: {
                title: "Your Personality Number",
                intro: "Your Personality Number shapes how your charisma and creative energy are projected to the world.",
                details: "A Personality Number of 3 gives off a youthful, fun-loving, and expressive vibe. People see you as optimistic, articulate, and imaginative.",
                perception: "Because of this number, you’re often viewed as a bright spirit who brings joy, humor, and inspiration into others’ lives.",
                strengths: [
                    "Expressive – articulate and eloquent, whether in speech or writing",
                    "Creative – brimming with artistic flair and originality",
                    "Charming – naturally magnetic and likable",
                    "Upbeat – carry a positive and lively energy",
                    "Sociable – enjoy engaging with others and building connections"
                ],
                challenges: [
                    "Scattered – may struggle to focus or follow through",
                    "Overly emotional – can be dramatic or reactive",
                    "Avoidant – may dodge deeper responsibilities or commitments",
                    "Superficial – may prioritize appearances over substance",
                    "Ego-driven – crave attention and external validation"
                ]
            },

            4: {
                title: "Your Personality Number",
                intro: "Your Personality Number reflects the image of reliability and order that others see in you.",
                details: "A Personality Number of 4 makes you seem dependable, grounded, and practical. You are often perceived as a stabilizing force who brings structure wherever you go.",
                perception: "Others view you as a hard worker, someone who is methodical, responsible, and trustworthy.",
                strengths: [
                    "Disciplined – excel at setting routines and following through",
                    "Hardworking – give consistent effort and value productivity",
                    "Dependable – people know they can rely on you",
                    "Structured thinker – bring order and clarity to chaos",
                    "Detail-oriented – catch what others miss and ensure quality"
                ],
                challenges: [
                    "Stubbornness – resist change or new ideas",
                    "Overly rigid – may have difficulty adapting or letting go",
                    "Fear of risks – prefer the safe and familiar",
                    "Overwork – prone to burnout by pushing too hard",
                    "Reluctant to adapt – struggle in fast-moving or chaotic environments"
                ]
            },

            5: {
                title: "Your Personality Number",
                intro: "Your Personality Number expresses your free-spirited and dynamic nature to the outside world.",
                details: "A Personality Number of 5 makes you come across as adventurous, quick-witted, and exciting. You radiate curiosity and a zest for life.",
                perception: "You’re often perceived as someone who thrives on variety, change, and new experiences.",
                strengths: [
                    "Adventurous – always ready to try something new",
                    "Versatile – adapt quickly to people, places, and situations",
                    "Dynamic – bring energy and momentum wherever you go",
                    "Persuasive – can influence and excite others easily",
                    "Curious – love learning, exploring, and pushing boundaries"
                ],
                challenges: [
                    "Restless – may have difficulty staying in one place or routine",
                    "Impulsive – act before thinking things through",
                    "Commitment-phobic – avoid long-term obligations",
                    "Scattered – struggle to finish what you start",
                    "Overindulgent – may seek stimulation to unhealthy extremes"
                ]
            },

            6: {
                title: "Your Personality Number",
                intro: "Your Personality Number reveals your nurturing and responsible image as seen by others.",
                details: "A Personality Number of 6 gives you a warm, loving, and protective aura. People often look to you for guidance, care, and comfort.",
                perception: "You’re seen as a natural caregiver, someone who brings harmony, beauty, and support into others’ lives.",
                strengths: [
                    "Nurturing – take care of others with great compassion",
                    "Responsible – feel a deep sense of duty and reliability",
                    "Protective – stand up for loved ones and the vulnerable",
                    "Aesthetic – have an eye for beauty, design, and balance",
                    "Generous – give freely of time, energy, and love"
                ],
                challenges: [
                    "Overprotective – may smother or control out of care",
                    "Self-sacrificing – put others’ needs far above your own",
                    "Judgmental – hold high expectations of others",
                    "Stuck in roles – may lose identity in service to others",
                    "Conflict-averse – prefer peace over necessary confrontation"
                ]
            },

            7: {
                title: "Your Personality Number",
                intro: "Your Personality Number represents the inner mystique and depth others sense from you.",
                details: "A Personality Number of 7 makes you appear intellectual, introspective, and a bit enigmatic. You come across as someone who prefers solitude and deep thinking.",
                perception: "People perceive you as wise, philosophical, and sometimes hard to fully understand.",
                strengths: [
                    "Intellectual – thrive on knowledge and discovery",
                    "Spiritual – deeply drawn to metaphysics or the unknown",
                    "Private – keep your inner world protected",
                    "Analytical – approach life with logic and observation",
                    "Intuitive – trust inner guidance and subtle insight"
                ],
                challenges: [
                    "Detached – may seem aloof or emotionally distant",
                    "Overly reserved – keep too much bottled up",
                    "Skeptical – need proof before trusting others",
                    "Pessimistic – prone to worry or overthinking",
                    "Socially distant – prefer solitude, which can isolate"
                ]
            },

            8: {
                title: "Your Personality Number",
                intro: "Your Personality Number shows the aura of power, ambition, and success that you project.",
                details: "A Personality Number of 8 makes you appear confident, business-minded, and capable of handling responsibility. You give off an executive, authoritative vibe.",
                perception: "You’re seen as someone who commands respect and seeks to achieve lasting material success.",
                strengths: [
                    "Ambitious – always aiming high and thinking big",
                    "Efficient – manage time, people, and resources well",
                    "Strategic – see the long game and move accordingly",
                    "Resilient – bounce back stronger from setbacks",
                    "Influential – lead with presence and command"
                ],
                challenges: [
                    "Controlling – can be overly forceful or demanding",
                    "Materialistic – may measure worth by status or wealth",
                    "Workaholic – over-prioritize career over personal life",
                    "Intimidating – may come across as too intense",
                    "Unforgiving – hold onto past wrongs or mistakes"
                ]
            },

            9: {
                title: "Your Personality Number",
                intro: "Your Personality Number shows how you appear to others in terms of compassion, wisdom, and emotional depth.",
                details: "A Personality Number of 9 gives you an air of maturity, empathy, and vision. You come across as someone who cares deeply about humanity and larger causes.",
                perception: "Because of this number, others may see you as inspiring, emotionally intelligent, and idealistic.",
                strengths: [
                    "Empathetic – deeply attuned to others’ emotions",
                    "Generous – give without expecting anything back",
                    "Emotionally intuitive – sense what people need without words",
                    "Artistically inclined – express through art, music, or beauty",
                    "Charming presence – naturally attract and comfort others"
                ],
                challenges: [
                    "Overgiving – risk burnout by doing too much for others",
                    "Sensitive to criticism – easily wounded emotionally",
                    "Prone to emotional fatigue – absorb too much energy from others",
                    "Idealistic – expect a perfect world that may not exist",
                    "Avoiding confrontation – let problems simmer rather than speak up"
                ]
            }
        };


        const numberData = meanings[personalityNumber];
        return (
            <div className="personality-number-section">
                <h3>{numberData.title} {personalityNumber}</h3>
                <p>{numberData.intro}</p>
                <p>{numberData.details}</p>
                <p>{numberData.perception}</p>

                <div className="flex-row">
                    <div>
                        <h4>Top 5 Strengths</h4>
                        <ul>{numberData.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div>
                        <h4>Top 5 Challenges</h4>
                        <ul>{numberData.challenges.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                </div>
            </div>

        );
    };

    const ExpressionNumberExplanationBlock = ({ expressionNumber }) => {
        if (!expressionNumber) return null;

        const meanings = {
            1: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 1, you’re a natural leader and innovator. You have a strong desire to stand out, take initiative, and forge your own path.",
                perception: "You express yourself with boldness and drive. Your presence is assertive and confident, and others often turn to you for leadership and inspiration.",
                strengths: [
                    "Leadership – You have a commanding presence and inspire others with your vision and confidence.",
                    "Determined – Once you commit to something, you pursue it with unshakeable resolve.",
                    "Independent – You thrive when making your own decisions and don't rely on others to get things done.",
                    "Creative – You often bring fresh, original ideas to the table and enjoy starting new projects.",
                    "Ambitious – You aim high and have the drive to achieve great things, even if it takes time."
                ],
                challenges: [
                    "Arrogance – Your confidence can sometimes come off as superiority or disregard for others' input.",
                    "Stubbornness – You may resist suggestions, believing your way is the best.",
                    "Impatience – You want fast results and may lose interest if progress feels slow.",
                    "Overbearing – In trying to lead, you may unintentionally dominate or dismiss others’ voices.",
                    "Isolation – Your independence can lead to going it alone, even when collaboration might be more effective."
                ]
            },

            2: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 2, you’re gentle, cooperative, and deeply intuitive. You work best when you can support, harmonize, or mediate.",
                perception: "You express yourself in a soft, balanced way and prefer peace over conflict. Others see you as a good listener, a peacemaker, and a reliable team player.",
                strengths: [
                    "Diplomatic – You naturally resolve conflicts and bring people together through understanding and tact.",
                    "Empathetic – You can sense others' emotions and offer genuine comfort and support.",
                    "Cooperative – You work well with others and often prioritize group harmony over personal recognition.",
                    "Loyal – Once committed, you're deeply devoted and trustworthy in relationships.",
                    "Intuitive – You often 'just know' things without needing them spelled out, and you trust your gut instincts."
                ],
                challenges: [
                    "Overly sensitive – You may take criticism or conflict personally and struggle to let go of emotional wounds.",
                    "Indecisive – You might avoid decisions for fear of upsetting others or making the wrong choice.",
                    "Avoidant – Confrontation may make you uncomfortable, even when it’s necessary.",
                    "Dependent – You may rely too much on others for affirmation or approval.",
                    "People-pleasing – You sometimes sacrifice your own needs to maintain peace."
                ]
            },

            3: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 3, you’re expressive, social, and imaginative. You shine through communication, creativity, and bringing joy to others.",
                perception: "You express yourself with enthusiasm and charm. Others are drawn to your optimism, humor, and artistic flair.",
                strengths: [
                    "Artistic – You have a natural talent for expressing beauty through words, music, design, or performance.",
                    "Optimistic – You usually see the bright side and lift others’ spirits with your cheerful outlook.",
                    "Expressive – You communicate easily and vividly, often captivating others with stories or insights.",
                    "Sociable – You thrive in social settings and build connections effortlessly.",
                    "Imaginative – Your mind is full of ideas, and you're often ahead of the curve in creativity."
                ],
                challenges: [
                    "Scattered – Your many ideas can make it hard to focus or finish what you start.",
                    "Overindulgent – You may lean toward pleasure or escapism when stressed.",
                    "Oversensitive – Praise lifts you, but criticism can wound deeply.",
                    "Superficial – You might sometimes avoid deeper issues in favor of fun or distractions.",
                    "Attention-seeking – You may need validation to feel secure or fulfilled."
                ]
            },

            4: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 4, you’re someone who values structure, stability, and hard work. You bring a grounded and dependable energy into everything you do.",
                perception: "You are naturally organized and driven by logic. You prefer systems, routines, and clearly defined goals. Others admire your consistency and reliability.",
                strengths: [
                    "Disciplined – You maintain strong routines and are committed to goals, even when results take time.",
                    "Hardworking – You have a tireless work ethic and are willing to put in long hours to accomplish what matters.",
                    "Dependable – People can count on you in both professional and personal settings because you honor commitments.",
                    "Structured thinker – You excel at creating order out of chaos and breaking down complex problems into practical steps.",
                    "Detail-oriented – You’re meticulous and attentive, catching what others overlook and delivering high-quality results."
                ],
                challenges: [
                    "Stubbornness – Once you form an opinion or method, it’s hard to persuade you to see things differently.",
                    "Overly rigid – You may resist flexibility or spontaneous changes, which can lead to missed opportunities.",
                    "Fear of risks – You tend to avoid stepping outside your comfort zone, even when taking a chance could lead to growth.",
                    "Overwork – Your dedication may lead to burnout if you don’t learn to pace yourself or delegate tasks.",
                    "Reluctant to adapt – You may struggle with sudden changes or uncertainty, preferring predictable and controlled environments."
                ]
            },

            5: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 5, you’re adaptable, energetic, and crave freedom. You express yourself through movement, exploration, and variety.",
                perception: "You're seen as dynamic and curious, someone who thrives on new experiences and change. Others see you as spontaneous, adventurous, and open-minded.",
                strengths: [
                    "Adaptable – You adjust easily to new situations and think on your feet.",
                    "Adventurous – You love travel, new experiences, and exploring different cultures or ideas.",
                    "Communicative – You express yourself well and are often persuasive or witty.",
                    "Energetic – You bring high energy and enthusiasm into whatever you're doing.",
                    "Freedom-loving – You don’t let rules confine you—you seek personal liberty and expansion."
                ],
                challenges: [
                    "Restless – You may get bored easily and constantly seek stimulation.",
                    "Impulsive – You might make quick decisions without thinking them through.",
                    "Commitment issues – Settling down or sticking with one path can feel limiting.",
                    "Reckless – Your desire for experience can lead to risky behavior.",
                    "Inconsistent – You may struggle with follow-through or sticking to schedules."
                ]
            },

            6: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 6, you’re nurturing, responsible, and have a strong sense of duty. You express yourself through caregiving, creativity, and building harmony.",
                perception: "Others see you as warm, dependable, and deeply committed to your family, community, or ideals.",
                strengths: [
                    "Nurturing – You instinctively care for others and offer comfort and support.",
                    "Responsible – You take obligations seriously and are often the one others rely on.",
                    "Creative – You have a keen eye for beauty and may express yourself through art, design, or music.",
                    "Balanced – You seek harmony and fairness, often mediating or restoring peace.",
                    "Loyal – Once you love, you love deeply and stand by your commitments."
                ],
                challenges: [
                    "Overgiving – You may neglect your own needs while caring for others.",
                    "Perfectionism – You may hold yourself and others to unrealistic standards.",
                    "Control issues – You might try to “fix” people or situations beyond your control.",
                    "Martyrdom – You may suffer in silence or sacrifice too much for others.",
                    "Judgmental – Your strong sense of right and wrong can make you critical at times."
                ]
            },

            7: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 7, you’re introspective, intellectual, and spiritually curious. You express yourself through study, reflection, and inner knowing.",
                perception: "People see you as thoughtful, wise, and mysterious. You're not always expressive outwardly, but your mind is rich with insight and analysis.",
                strengths: [
                    "Analytical – You love solving problems and uncovering hidden truths.",
                    "Introspective – You gain strength through solitude and reflection.",
                    "Spiritual – You're drawn to the metaphysical and deeper meanings in life.",
                    "Focused – You can immerse yourself in complex studies or goals.",
                    "Wise – You often see what others miss and offer profound perspectives."
                ],
                challenges: [
                    "Withdrawn – You may isolate or keep emotions hidden.",
                    "Overthinking – You can get stuck in analysis or mental loops.",
                    "Cynicism – You may doubt or distrust others' intentions.",
                    "Emotionally detached – You may struggle to express feelings openly.",
                    "Elitist – You may view others as less capable if they don’t think as deeply."
                ]
            },

            8: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 8, you're ambitious, strategic, and highly capable in matters of power and success. You express yourself through leadership, efficiency, and mastery over the material world.",
                perception: "You’re seen as a strong, capable individual who commands respect and gets results. You often carry an aura of authority.",
                strengths: [
                    "Leadership – You have a commanding presence and take charge with confidence.",
                    "Strategic – You plan well, think long-term, and know how to execute big visions.",
                    "Ambitious – You’re driven to succeed and achieve status, wealth, or influence.",
                    "Disciplined – You manage time and resources effectively to reach goals.",
                    "Influential – You can inspire and mobilize others toward a shared objective."
                ],
                challenges: [
                    "Workaholic – You may become consumed by career or material goals.",
                    "Power struggles – You might clash with authority or come across as controlling.",
                    "Emotionally guarded – You may struggle to show vulnerability or ask for help.",
                    "Materialistic – You may place too much importance on money or success.",
                    "Harsh – Your high standards can make you critical or demanding."
                ]
            },

            9: {
                title: "Your Expression Number",
                intro: "Your Expression Number reveals the innate abilities, talents, and potential you're born with. It shows how you naturally express yourself and approach life’s tasks.",
                details: "If your Expression Number is 9, you're compassionate, idealistic, and deeply motivated to help others. You express yourself through service, creativity, and emotional depth.",
                perception: "You’re seen as wise, generous, and often ahead of your time. Others may view you as a humanitarian with strong values.",
                strengths: [
                    "Compassionate – You care deeply and want to ease others’ suffering.",
                    "Visionary – You think big and are often drawn to humanitarian or artistic missions.",
                    "Emotional depth – You’re not afraid to feel or confront deep truths.",
                    "Generous – You give freely of your time, love, and resources.",
                    "Inspirational – Your ideals and actions move others toward positive change."
                ],
                challenges: [
                    "Overwhelmed – You may take on too much emotional or spiritual weight.",
                    "Disillusionment – High ideals can lead to disappointment with reality.",
                    "Self-sacrificing – You may give more than you have, leading to depletion.",
                    "Boundary issues – You may struggle to say no or separate your emotions from others'.",
                    "Judgmental – You may see the world in black and white and expect others to live up to your ideals."
                ]
            }
        };

        const numberData = meanings[expressionNumber];
        return (
            <div className="expression-number-section">
                <h3>{numberData.title} {expressionNumber}</h3>
                <p>{numberData.intro}</p>
                <p>{numberData.details}</p>
                <p>{numberData.perception}</p>

                <div className="flex-row">
                    <div>
                        <h4>Top 5 Strengths</h4>
                        <ul>{numberData.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div>
                        <h4>Top 5 Challenges</h4>
                        <ul>{numberData.challenges.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                </div>
            </div>

        );
    };

    return (
        <div className="numerology-container">
            {!numerologyResult ? (
                <div>
                    <div className="number-form-section">

                        <h2 style={{ color: "white", textAlign: "center", marginBottom: "40px" }}>Unlock Your Lucky, Destiny and Friendly Numbers </h2>

                        <form onSubmit={handleNumerologySubmit} className="number-form">
                            <div>
                                <label>
                                    Full Name:<br />
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Date of Birth:<br />
                                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                                </label>
                            </div>
                            <button type="submit">Calculate</button>
                        </form>
                        {error && <div className="error-message">{error}</div>}


                    </div>

                    <div className="what-why-numerology" >
                        <div className="image-column">
                            <img src={numberimg1} alt="Number Illustration 1" className="number-img-1" />
                        </div>

                        <div className="text-columns-container">
                            <div className="column">
                                <h3>What is Numerology?</h3>
                                <p>
                                    The word numerology is the science of numbers. The Numerology word comes from the Latin root, “numerus,” which means number and the Greek word, “logos,” which refers word or thought. These number-thoughts, or numerology is an ancient method of divination where numerical vibrations are charted in order to determine or predict the pattern of trends for the future.
                                </p>
                            </div>

                            <div className="column">
                                <h3>Why Numerology?</h3>
                                <p>
                                    Once you learn how to use numerology successfully and implement it in your daily life you will soon see how it can guide you on a path to personal fulfillment and enjoyment. Numerology can be used to find a compatible partner, choose a career, determine your destiny and allows for full advantage of lucky days, events and years.
                                </p>
                            </div>
                        </div>


                    </div>

                    <div className="how-numerology">
                        <div className="how-columns">
                            <div className="text-column" style={{textAlign:"justify"}}>
                                <h3>How does Numerology Work?</h3>
                                <p>How does Numerology Work?
                                    Your ruling number can be calculated by adding the numbers from your birth date. In other words, your ruling number is the sum of your birthdays. Your numerology number serves as a road map for your life.

                                    Using the Numerology Calculator, you can obtain detailed information about your parents, partner, children, health, career, and job. Numerology provides a mathematical formula that directs your Karmic Pathway based on your date of birth and name. As you move forward in your life, the day of your birth indicates your chosen mission.

                                    A Free Numerology Report will tell you anything, from discovering facts about a person to learning about the world. Without a doubt, it is regarded as a universal language of numbers, and a Free Vedic Numerology Calculator can assist you in comprehending that language. Vedic Rishi presents you with a complete numerology report of the Astro Numerology Calculator based on Vedic Principles, which allows us to better understand ourselves as individuals and the world.</p>


                            </div>

                            <div className="image-column">
                                <img src={numberimg2} alt="Number Illustration 2" className="number-img-2" />
                            </div>
                        </div>
                    </div>


                </div>

            ) : (
                <div ref={resultRef}>
                    <div style={{ marginTop: "2rem", textAlign: "center", fontSize: 22 }}>
                        <button
                            onClick={() => {
                                setNumerologyResult(null);
                                localStorage.removeItem("numerologyResult");
                            }}
                            style={{
                                marginRight: 22,
                                border: "none",
                                all: "unset",
                                cursor: "pointer",
                                float: "right"
                            }}
                        >
                            🔄
                        </button>

                    </div>

                    <h2 style={{ color: "white" }}>Numerology Results</h2>
                    <div style={{ background: "#efdefc", padding: 16, borderRadius: 8, marginBottom: "2rem" }}>
                        <h3>Core Numbers for {numerologyResult.full_name}</h3>
                        <NumerologySummaryBlock result={numerologyResult} />

                    </div>

                    <LifePathExplanationBlock
                        dateOfBirth={numerologyResult.date_of_birth}
                        lifePathNumber={numerologyResult.life_path_number}
                    />



                    <LifePathInsightBlock number={numerologyResult.life_path_number} />



                    <DestinyNumberExplanationBlock
                        fullName={numerologyResult.full_name}
                        destinyNumber={numerologyResult.destiny_number}
                    />



                    <PersonalityNumberExplanationBlock
                        personalityNumber={numerologyResult.personality_number}
                    />



                    <ExpressionNumberExplanationBlock
                        expressionNumber={numerologyResult.expression_number}
                    />


                </div>
            )}
        </div>
    );
};

export default NumerologyCalculator;