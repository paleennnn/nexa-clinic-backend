--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

-- Started on 2026-09-09 18:53:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 136208)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 856 (class 1247 OID 136226)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'L',
    'P'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 859 (class 1247 OID 136232)
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentType" AS ENUM (
    'UMUM',
    'BPJS',
    'ASURANSI'
);


ALTER TYPE public."PaymentType" OWNER TO postgres;

--
-- TOC entry 865 (class 1247 OID 136250)
-- Name: QueueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QueueStatus" AS ENUM (
    'WAITING',
    'CALLED',
    'IN_PROGRESS',
    'DONE',
    'SKIPPED'
);


ALTER TYPE public."QueueStatus" OWNER TO postgres;

--
-- TOC entry 862 (class 1247 OID 136240)
-- Name: RegistrationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RegistrationStatus" AS ENUM (
    'MENUNGGU',
    'CHECK_IN',
    'PEMERIKSAAN',
    'SELESAI'
);


ALTER TYPE public."RegistrationStatus" OWNER TO postgres;

--
-- TOC entry 853 (class 1247 OID 136219)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'DOKTER',
    'PETUGAS_PENDAFTARAN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 136270)
-- Name: Doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Doctor" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "poliId" text NOT NULL,
    "sipNumber" text,
    specialization text
);


ALTER TABLE public."Doctor" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 136319)
-- Name: MedicalAction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalAction" (
    id text NOT NULL,
    "medicalRecordId" text NOT NULL,
    "actionName" text NOT NULL,
    notes text
);


ALTER TABLE public."MedicalAction" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 136311)
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalRecord" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    subjective text NOT NULL,
    "bloodPressure" text NOT NULL,
    temperature double precision NOT NULL,
    weight double precision NOT NULL,
    height double precision NOT NULL,
    diagnosis text NOT NULL,
    "therapyPlan" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MedicalRecord" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 136284)
-- Name: Patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Patient" (
    id text NOT NULL,
    "noRm" text NOT NULL,
    nik text NOT NULL,
    name text NOT NULL,
    gender public."Gender" NOT NULL,
    "birthDate" timestamp(3) without time zone NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Patient" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 136277)
-- Name: Poli; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Poli" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL
);


ALTER TABLE public."Poli" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 136326)
-- Name: Prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Prescription" (
    id text NOT NULL,
    "medicalRecordId" text NOT NULL
);


ALTER TABLE public."Prescription" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 136333)
-- Name: PrescriptionItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrescriptionItem" (
    id text NOT NULL,
    "prescriptionId" text NOT NULL,
    "medicineName" text NOT NULL,
    dosage text NOT NULL,
    quantity integer NOT NULL,
    instructions text
);


ALTER TABLE public."PrescriptionItem" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 136302)
-- Name: Queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Queue" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "queueNumber" text NOT NULL,
    "queueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."QueueStatus" DEFAULT 'WAITING'::public."QueueStatus" NOT NULL,
    "calledAt" timestamp(3) without time zone
);


ALTER TABLE public."Queue" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 136293)
-- Name: Registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Registration" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "poliId" text NOT NULL,
    "visitDate" timestamp(3) without time zone NOT NULL,
    "paymentType" public."PaymentType" NOT NULL,
    "chiefComplaint" text NOT NULL,
    status public."RegistrationStatus" DEFAULT 'MENUNGGU'::public."RegistrationStatus" NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Registration" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 136261)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 136209)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4987 (class 0 OID 136270)
-- Dependencies: 217
-- Data for Name: Doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Doctor" (id, "userId", "poliId", "sipNumber", specialization) FROM stdin;
b696ee3b-a2d7-407c-9c94-65b15c7641b3	4b541f85-2d3a-4f95-b365-6260a83d629e	52ac74c6-6cbe-4639-b411-bf6e4373638b	\N	Dokter Umum
\.


--
-- TOC entry 4993 (class 0 OID 136319)
-- Dependencies: 223
-- Data for Name: MedicalAction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedicalAction" (id, "medicalRecordId", "actionName", notes) FROM stdin;
\.


--
-- TOC entry 4992 (class 0 OID 136311)
-- Dependencies: 222
-- Data for Name: MedicalRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedicalRecord" (id, "registrationId", "patientId", "doctorId", subjective, "bloodPressure", temperature, weight, height, diagnosis, "therapyPlan", "createdAt") FROM stdin;
\.


--
-- TOC entry 4989 (class 0 OID 136284)
-- Dependencies: 219
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Patient" (id, "noRm", nik, name, gender, "birthDate", phone, address, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4988 (class 0 OID 136277)
-- Dependencies: 218
-- Data for Name: Poli; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Poli" (id, name, code) FROM stdin;
52ac74c6-6cbe-4639-b411-bf6e4373638b	Poli Umum	UMUM
\.


--
-- TOC entry 4994 (class 0 OID 136326)
-- Dependencies: 224
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Prescription" (id, "medicalRecordId") FROM stdin;
\.


--
-- TOC entry 4995 (class 0 OID 136333)
-- Dependencies: 225
-- Data for Name: PrescriptionItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrescriptionItem" (id, "prescriptionId", "medicineName", dosage, quantity, instructions) FROM stdin;
\.


--
-- TOC entry 4991 (class 0 OID 136302)
-- Dependencies: 221
-- Data for Name: Queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Queue" (id, "registrationId", "queueNumber", "queueDate", status, "calledAt") FROM stdin;
\.


--
-- TOC entry 4990 (class 0 OID 136293)
-- Dependencies: 220
-- Data for Name: Registration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Registration" (id, "patientId", "doctorId", "poliId", "visitDate", "paymentType", "chiefComplaint", status, "createdBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 4986 (class 0 OID 136261)
-- Dependencies: 216
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, "isActive", "createdAt", "updatedAt") FROM stdin;
08c078b3-528e-4925-aa37-2241b86c8ecf	Administrator	admin@clinic.test	$2b$10$mF5lqTScH0/VrqopuK859.eWpdNPa9fj65IPsYvQMp6nQH/uEC92G	ADMIN	t	2026-09-09 11:49:07.753	2026-09-09 11:49:07.753
ec015427-c42f-4811-b66e-5ac02bf321d3	Petugas Pendaftaran	petugas@clinic.test	$2b$10$D2xE54dLQQ6KMCyvWJ7h2ulob64C.bEEnwrko4ICf/8bkrDbpVaFq	PETUGAS_PENDAFTARAN	t	2026-09-09 11:49:07.846	2026-09-09 11:49:07.846
4b541f85-2d3a-4f95-b365-6260a83d629e	Dr. Contoh	dokter@clinic.test	$2b$10$zB.TfB7ipZC1EH678gylv.7ZFndnznvdbYkuRZ/9H6B5B0xy9xNBq	DOKTER	t	2026-09-09 11:49:07.934	2026-09-09 11:49:07.934
\.


--
-- TOC entry 4985 (class 0 OID 136209)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1818cf16-5feb-49f6-9fe5-7633c75b75a8	0c246415ccb61e610f5d20f4714471811450d36b04115d0a2e6c1db74253722b	2026-09-09 18:49:06.427436+07	20260908051946_init	\N	\N	2026-09-09 18:49:06.263588+07	1
\.


--
-- TOC entry 4806 (class 2606 OID 136276)
-- Name: Doctor Doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 136325)
-- Name: MedicalAction MedicalAction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalAction"
    ADD CONSTRAINT "MedicalAction_pkey" PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 136318)
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 136292)
-- Name: Patient Patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_pkey" PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 136283)
-- Name: Poli Poli_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Poli"
    ADD CONSTRAINT "Poli_pkey" PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 136339)
-- Name: PrescriptionItem PrescriptionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 136332)
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 136310)
-- Name: Queue Queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue"
    ADD CONSTRAINT "Queue_pkey" PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 136301)
-- Name: Registration Registration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_pkey" PRIMARY KEY (id);


--
-- TOC entry 4804 (class 2606 OID 136269)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 136217)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 1259 OID 136341)
-- Name: Doctor_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Doctor_userId_key" ON public."Doctor" USING btree ("userId");


--
-- TOC entry 4822 (class 1259 OID 136346)
-- Name: MedicalRecord_registrationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MedicalRecord_registrationId_key" ON public."MedicalRecord" USING btree ("registrationId");


--
-- TOC entry 4811 (class 1259 OID 136344)
-- Name: Patient_nik_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_nik_key" ON public."Patient" USING btree (nik);


--
-- TOC entry 4812 (class 1259 OID 136343)
-- Name: Patient_noRm_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Patient_noRm_key" ON public."Patient" USING btree ("noRm");


--
-- TOC entry 4808 (class 1259 OID 136342)
-- Name: Poli_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Poli_code_key" ON public."Poli" USING btree (code);


--
-- TOC entry 4825 (class 1259 OID 136347)
-- Name: Prescription_medicalRecordId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Prescription_medicalRecordId_key" ON public."Prescription" USING btree ("medicalRecordId");


--
-- TOC entry 4819 (class 1259 OID 136345)
-- Name: Queue_registrationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Queue_registrationId_key" ON public."Queue" USING btree ("registrationId");


--
-- TOC entry 4802 (class 1259 OID 136340)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4830 (class 2606 OID 136353)
-- Name: Doctor Doctor_poliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES public."Poli"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4831 (class 2606 OID 136348)
-- Name: Doctor Doctor_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4839 (class 2606 OID 136393)
-- Name: MedicalAction MedicalAction_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalAction"
    ADD CONSTRAINT "MedicalAction_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4836 (class 2606 OID 136388)
-- Name: MedicalRecord MedicalRecord_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4837 (class 2606 OID 136383)
-- Name: MedicalRecord MedicalRecord_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4838 (class 2606 OID 136378)
-- Name: MedicalRecord MedicalRecord_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4841 (class 2606 OID 136403)
-- Name: PrescriptionItem PrescriptionItem_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4840 (class 2606 OID 136398)
-- Name: Prescription Prescription_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4835 (class 2606 OID 136373)
-- Name: Queue Queue_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Queue"
    ADD CONSTRAINT "Queue_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4832 (class 2606 OID 136363)
-- Name: Registration Registration_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4833 (class 2606 OID 136358)
-- Name: Registration Registration_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4834 (class 2606 OID 136368)
-- Name: Registration Registration_poliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES public."Poli"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-09-09 18:53:17

--
-- PostgreSQL database dump complete
--

